const path = require('path');
const fs = require('fs-extra');
const extend = require('extend');
const nodemon = require('nodemon');
const { provider } = require('jimple');
const NodeWatcher = require('../../abstracts/nodeWatcher');
/**
 * This service implements `nodemon` and {@link NodeWatcher} in order to run Node apps while
 * watching, transpiling and copying files.
 * @extends {NodeWatcher}
 */
class BuildNodeRunnerProcess extends NodeWatcher {
  /**
   * @param {Logger}                       appLogger            The inform on the CLI of the events
   *                                                            of the runner.
   * @param {BuildTranspiler}              buildTranspiler      To transpile files if needed.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the watch settings.
   */
  constructor(appLogger, buildTranspiler, projectConfiguration) {
    super({
      poll: projectConfiguration.others.watch.poll,
    });
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
     * A simple flag to check whether the process is running or not.
     * @type {boolean}
     */
    this.running = false;
    /**
     * @property {string} executable The path to the file `nodemon` will execute.
     * @property {Array}  watch      The list of directories `nodemon` will watch in orderto reset
     *                               the execution.
     * @property {Array}  ignore     A list of patterns `nodemon` will ignore whilewatching
     *                               directories.
     * @property {Object} envVars    A dictionary of environment variables to send to theexecution
     *                               process.
     */
    this.defaultOptions = {
      executable: '',
      watch: [],
      envVars: {},
      ignore: [],
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
     * Bind the method that will be exported as the service.
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
  }
  /**
   * Run a Node application.
   * @param {string} executable              The path to the file to execute.
   * @param {Array}  watch                   The list of directories to watch in order to restart
   *                                         the application.
   * @param {Array}  [transpilationPaths=[]] A list of dictionaries with `from` and `to` paths the
   *                                         service will use for transpilation when files change
   *                                         during the execution, in order to restart the
   *                                         application.
   * @param {Array}  [copyPaths=[]]          A list of dictionaries with `from` and `to` paths the
   *                                         service will use for copying files when they change
   *                                         during the execution, in order to restart the
   *                                         application.
   * @param {Object} [envVars={}]            A dictionary with extra environment variables to send
   *                                         to the execution process.
   * @param {Array}  [ignore=['.test.js']]   A list of file name patterns the service that will be
   *                                         ignored by the `nodemon` watcher.
   * @return {Nodemon}
   * @throws {Error} if the process is already running.
   * @throws {Error} if the executable doesn't exist.
   */
  run(
    executable,
    watch,
    transpilationPaths = [],
    copyPaths = [],
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
    // Merge the default options with the parameters.
    this.options = extend(true, {}, this.defaultOptions, {
      executable,
      watch,
      envVars,
      ignore,
    });
    /**
     * This part is tricky...
     * First, make sure there's at least one item on the transpilation paths list, because that
     * means that the files are being executed from a different path than its source directory.
     * If the files change location, and the application depends on files outside its directory,
     * then the service will watch the transpilation paths, for files that need to be moved and
     * transpiled, and the copy files, for files that just need to be moved.
     * The reason this is _"tricky"_ is because the copy paths are only added if there's
     * transpilation, because there's no need to copy files if the code doesn't change locations.
     */
    if (transpilationPaths.length) {
      this.watch(
        [
          ...transpilationPaths.map(({ from }) => from),
          ...copyPaths.map(({ from }) => from),
        ],
        transpilationPaths,
        copyPaths
      );
    }
    // Start `nodemon`.
    nodemon({
      script: this.options.executable,
      watch: this.options.watch,
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
   * This is called when a source file changes and it's detected by the service, not `nodemon`.
   * The overwrite is just to show a log message saying that the process will be restarted, as the
   * parent class will end up transpiling or copying a file into one the directories `nodemon`
   * watches.
   * @param {string} file The path to the file that changed.
   * @access protected
   * @ignore
   */
  _onChange(file) {
    this.appLogger.warning(`Restarting because a file was modified: ${file}`);
    super._onChange(file);
  }
  /**
   * This is called when a source file changes and the service can't find a matching path on neither
   * the transpilation paths nor the copy paths.
   * The method will just show an error message explaning the problem and call the method that shows
   * the error when `nodemon` crashes.
   * @access protected
   * @ignore
   */
  _onInvalidPathForChange() {
    this.appLogger.error('Error: The file directory is not on the list of allowed paths');
    this._onNodemonCrash();
  }
  /**
   * Transpiles a file from a source directory into a build directory, which `nodemon` watches.
   * @param {string} source The path to the source file.
   * @param {string} output The path for the source file once transpiled.
   * @access protected
   * @ignore
   */
  _transpileFile(source, output) {
    try {
      // Make sure the path to the directory exists.
      fs.ensureDirSync(path.dirname(output));
      // Transpile the file.
      this.buildTranspiler.transpileFileSync({ source, output });
      this.appLogger.success('The file was successfully copied and transpiled');
    } catch (error) {
      this.appLogger.error('Error: The file couldn\'t be updated');
      this.appLogger.error(error);
      this._onNodemonCrash();
    }
  }
  /**
   * Copies a file from a source directory into a build directory, which `nodemon` watches.
   * @param {string} from The original path of the file.
   * @param {string} to   The new path for the file.
   * @access protected
   * @ignore
   */
  _copyFile(from, to) {
    try {
      // Make sure the path to the directory exists.
      fs.ensureDirSync(path.dirname(to));
      // Copy the file.
      fs.copySync(from, to);
      this.appLogger.success('The file was successfully copied');
    } catch (error) {
      this.appLogger.error('Error: The file couldn\'t be copied');
      this.appLogger.error(error);
      this._onNodemonCrash();
    }
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
        ...this.options.watch.map((directory) => `watching: ${directory}`),
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
     * If the code requires transpilation (which means that the service is watching directories)
     * and this was triggered by file changes, the restart message was already printed by the
     * `_onChange` method, so no need to print anything else.
     */
    if (!this.watching) {
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
   * the watcher and then exits the current process.
   * @ignore
   * @access protected
   */
  _onNodemonQuit() {
    // If the service is watching directories...
    if (this.watching) {
      // ...then it should be stopped.
      this.stop();
    }

    // eslint-disable-next-line no-process-exit
    process.exit();
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
