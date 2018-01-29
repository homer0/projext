const path = require('path');
const fs = require('fs-extra');
const extend = require('extend');
const nodemon = require('nodemon');
const Watchpack = require('watchpack');
const { provider } = require('jimple');
/**
 * This service implements both `nodemon` and `watchpack` in order to run Node apps while watching
 * and transpiling if necessary.
 */
class BuildNodeRunnerProcess {
  /**
   * Class constructor.
   * @param {Logger}                       appLogger            The inform on the CLI of the events
   *                                                            of the runner.
   * @param {BuildTranspiler}              buildTranspiler      To transpile files if required.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the project paths.
   */
  constructor(appLogger, buildTranspiler, projectConfiguration) {
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `buildTranspiler` service.
     * @type {BuildTranspiler}
     */
    this.buildTranspiler = buildTranspiler;
    /**
     * The watcher that will check of changes on the target source directory.
     * @type {Watchpack}
     */
    this.watcher = new Watchpack({
      poll: projectConfiguration.others.watch.poll,
    });
    /**
     * A simple flag to check whether the process is running or not.
     * @type {boolean}
     */
    this.running = false;
    /**
     * The default options for when the service runs a target. These will be overwritten by the
     * parameters sent to the `run` method.
     * @type {Object}
     * @property {string}  executable            The path to the executable file.
     * @property {Array}   watch                 A list of directories to watch.
     * @property {Array}   ignore                A list of patterns to ignore.
     * @property {string}  sourcePath            The path to the source files.
     * @property {string}  executionPath         The path to the files being executed.
     * @property {Object}  envVars               A dictionary of environment variables to send to
     *                                           the process.
     * @property {boolean} requiresTranspilation Whether or not the target requires transpilation.
     */
    this.defaultOptions = {
      executable: '',
      watch: [],
      ignore: [],
      sourcePath: '',
      executionPath: '',
      envVars: {},
      requiresTranspilation: false,
    };
    /**
     * This dictionary is where the parameters sent to the `run` method and the `defaultOptions`
     * will be merged.
     * @type {Object}
     */
    this.options = {};
    /**
     * Whether or not the process logged the starting message.
     * @type {boolean}
     * @ignore
     * @access protected
     */
    this._started = false;
    /**
     * Whether or not the process is currently being restarted.
     * @type {boolean}
     * @ignore
     * @access protected
     */
    this._restaring = false;
    /**
     * Bind the method to export it as the main service.
     * @ignore
     */
    this.run = this.run.bind(this);
    /**
     * Bind the method to send it to the `nodemon` events listener.
     * @ignore
     */
    this._onNodemonStart = this._onNodemonStart.bind(this);
    /**
     * Bind the method to send it to the `nodemon` events listener.
     * @ignore
     */
    this._onNodemonRestart = this._onNodemonRestart.bind(this);
    /**
     * Bind the method to send it to the `nodemon` events listener.
     * @ignore
     */
    this._onNodemonCrash = this._onNodemonCrash.bind(this);
    /**
     * Bind the method to send it to the `nodemon` events listener.
     * @ignore
     */
    this._onNodemonQuit = this._onNodemonQuit.bind(this);
    /**
     * Bind the method to send it to the `watchpack` events listener.
     * @ignore
     */
    this._onFileChange = this._onFileChange.bind(this);
  }
  /**
   * Run a Node app.
   * @param {string} executable             The app executable.
   * @param {Array}  watchOn                A list of directories to watch.
   * @param {string} sourcePath             The path to the source code of the app. If it doesn't
   *                                        match with `executionPath`, then the code needs
   *                                        transpilation.
   * @param {string} executionPath          The path to where the app is being executed. If it
   *                                        doesn't match with `sourcePath`, then the code needs
   *                                        transpilation.
   * @param {Object} [envVars={}]           A dictionary with extra environment variables to send to
   *                                        the process.
   * @param {Array}  [ignore=['*.test.js']] A list of patterns to ignore on the watch.
   * @return {Nodemon}
   * @throws {Error} if the process is already running.
   * @throws {Error} if the executable doesn't exist.
   */
  run(
    executable,
    watchOn,
    sourcePath,
    executionPath,
    envVars = {},
    ignore = ['*.test.js']
  ) {
    // Check that is not already running and that the executable exists.
    if (this.running) {
      throw new Error(
        'The process is already running, you can\'t start it more than once'
      );
    } else if (!fs.pathExistsSync(executable)) {
      throw new Error(`The target executable doesn't exist (${executable})`);
    }
    // Turn on the flag that tells the service the process is running.
    this.running = true;
    // Define the options.
    this.options = extend(true, {}, this.defaultOptions, {
      executable,
      watchOn,
      ignore,
      sourcePath,
      executionPath,
      envVars,
      requiresTranspilation: (sourcePath !== executionPath),
    });
    // If the code requires transpilation...
    if (this.options.requiresTranspilation) {
      // ...turn on `watchpack`.
      this.watcher.watch([], [this.options.sourcePath]);
      this.watcher.on('change', this._onFileChange);
    }
    // Execute `nodemon`.
    nodemon({
      script: this.options.executable,
      watch: this.options.watchOn,
      ignore: this.options.ignore,
      env: Object.assign({}, process.env, this.options.envVars),
    });
    // Add the `nodemon` listeners.
    nodemon.on('start', this._onNodemonStart);
    nodemon.on('restart', this._onNodemonRestart);
    nodemon.on('crash', this._onNodemonCrash);
    nodemon.on('quit', this._onNodemonQuit);

    return nodemon;
  }
  /**
   * This is called when `nodemon` starts the process and after each time it restarts it. The
   * method just prints information messages and turn on the `_started` flag.
   * @param {boolean} [forceLog=false] By default, it only logs the messages the first time, but
   *                                   if this flag is `true`, it will do it anyways. This is
   *                                   used from the `_onNodemonRestart` to make sure the restart
   *                                   messages are shown before the start.
   * @ignore
   * @access protected
   */
  _onNodemonStart(forceLog = false) {
    // Only log the messages if it is the first time or if the force flag is `true.`
    if (!this._started || forceLog) {
      this.appLogger.success(`Starting ${this.options.executable}`);
      this.appLogger.info([
        'to restart at any time, enter \'rs\'',
        ...this.options.watchOn.map((directory) => `watching: ${directory}`),
      ]);
      // Turn on the flag that informs the service this method was executed at least once.
      this._started = true;
    }
  }
  /**
   * This is called when `nodemon` restarts a process, because a file changed or because the user
   * requested it. It only prints information messages.
   * @param {?Array} files A list of files that changed, thus triggering the restart.
   * @ignore
   * @access protected
   */
  _onNodemonRestart(files) {
    /**
     * If the code requires transpilation and this was triggered by file changes, the restart
     * message was already printed by the `watchpack` listener, so no need to print anything else.
     */
    if (!this.options.requiresTranspilation) {
      if (files && files.length) {
        const [file] = files;
        this.appLogger.warning(`Restarting because file was modified: ${file}`);
      } else {
        this.appLogger.warning('Restarting');
      }
    } else if (!files) {
      /**
       * If the code requires transpilation but the change was triggered by the user, then is ok to
       * show a message.
       */
      this.appLogger.warning('Restarting');
    }
    /**
     * After showing the restart messages, show the start messages again.
     * This is done this way because for some reason, the events were being triggered before the
     * `start` and then the `restart`, showing the messages out of order. This way, the `restart`
     * triggers the `start`, so the order of the message is always correct.
     */
    this._onNodemonStart(true);
  }
  /**
   * This is called when `nodemon` crashes and just prints a message saying that it is still
   * watching.
   * @ignore
   * @access protected
   */
  _onNodemonCrash() {
    this.appLogger.error('Crash - waiting for file changes before starting...');
  }
  /**
   * This is called when the `nodemon` process is stopeed. It first checks if it needs to turn off
   * the `watchpack` listener and then exists the current process.
   * @ignore
   * @access protected
   */
  _onNodemonQuit() {
    // If the code needs transpilation...
    if (this.options.requiresTranspilation) {
      // ...then `watchpack` is listening and should be stopped.
      this.watcher.close();
    }

    // eslint-disable-next-line no-process-exit
    process.exit();
  }
  /**
   * This is the `watchpack` listener and it gets called every time a source file changes. When this
   * happens, the service transpiles the file, thus triggering `nodemon` restart.
   * @param {string} file The path to the modified file.
   * @ignore
   * @access protected
   */
  _onFileChange(file) {
    this.appLogger.warning(`Restarting because file was modified: ${file}`);
    this._transpileFile(file);
  }
  /**
   * Transpile a file from the source directory into the execution directory (the one `nodemon` is
   * watching).
   * @param {string} file The path to the file.
   * @ignore
   * @access protected
   */
  _transpileFile(file) {
    const { sourcePath, executionPath } = this.options;
    const relative = file.substr(sourcePath.length);

    try {
      this.buildTranspiler.transpileFileSync({
        source: path.join(sourcePath, relative),
        output: path.join(executionPath, relative),
      });

      this.appLogger.success('The file was successfully copied and transpiled');
    } catch (error) {
      /**
       * By no throwing the error, we allow `nodemon` to keep listening so we can try making other
       * changes to the file in order transpile it correctly.
       */
      this.appLogger.error('Error: The file couldn\'t be updated');
      this.appLogger.error(error);
      this._onNodemonCrash();
    }
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildNodeRunnerProcess` as the `buildNodeRunnerProcess` service.
 * @example
 * // Register it on the container
 * container.register(buildNodeRunnerProcess);
 * // Getting access to the service instance
 * const buildNodeRunnerProcess = container.get('buildNodeRunnerProcess');
 * @type {Provider}
 */
const buildNodeRunnerProcess = provider((app) => {
  app.set('buildNodeRunnerProcess', () => new BuildNodeRunnerProcess(
    app.get('appLogger'),
    app.get('buildTranspiler'),
    app.get('projectConfiguration').getConfig()
  ).run);
});

module.exports = {
  BuildNodeRunnerProcess,
  buildNodeRunnerProcess,
};
