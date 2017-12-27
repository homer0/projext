const path = require('path');
const fs = require('fs-extra');
const extend = require('extend');
const nodemon = require('nodemon');
const Watchpack = require('watchpack');
const { provider } = require('jimple');

class BuildNodeRunnerProcess {
  constructor(appLogger, buildTranspiler, projectConfiguration) {
    this.appLogger = appLogger;
    this.buildTranspiler = buildTranspiler;
    this.watcher = new Watchpack({
      poll: projectConfiguration.others.watch.poll,
    });
    this.running = false;
    this.defaultOptions = {
      executable: '',
      watch: [],
      ignore: [],
      sourcePath: '',
      executionPath: '',
      envVars: {},
      requiresTranspilation: false,
    };
    this.options = {};

    this.run = this.run.bind(this);

    this._started = false;
    this._restaring = false;
    this._onNodemonStart = this._onNodemonStart.bind(this);
    this._onNodemonRestart = this._onNodemonRestart.bind(this);
    this._onNodemonCrash = this._onNodemonCrash.bind(this);
    this._onNodemonQuit = this._onNodemonQuit.bind(this);
    this._onFileChange = this._onFileChange.bind(this);
  }

  run(
    executable,
    watchOn,
    sourcePath,
    executionPath,
    envVars = {},
    ignore = ['*.test.js']
  ) {
    if (this.running) {
      throw new Error(
        'The process is already running, you can\'t start it more than once'
      );
    } else if (!fs.pathExistsSync(executable)) {
      throw new Error(`The target executable doesnt exist (${executable})`);
    }

    this.options = extend(true, {}, this.defaultOptions, {
      executable,
      watchOn,
      ignore,
      sourcePath,
      executionPath,
      envVars,
      requiresTranspilation: (sourcePath !== executionPath),
    });

    if (this.options.requiresTranspilation) {
      this.watcher.watch([], [this.options.sourcePath]);
      this.watcher.on('change', this._onFileChange);
    }

    nodemon({
      script: this.options.executable,
      watch: this.options.watchOn,
      ignore: this.options.ignore,
      env: Object.assign({}, process.env, this.options.envVars),
    });

    nodemon.on('start', this._onNodemonStart);
    nodemon.on('restart', this._onNodemonRestart);
    nodemon.on('crash', this._onNodemonCrash);
    nodemon.on('quit', this._onNodemonQuit);
  }

  _onNodemonStart(forceLog = false) {
    if (!this._started || forceLog) {
      this.appLogger.success(`Starting ${this.options.executable}`);
      this.appLogger.info([
        'to restart at any time, enter \'rs\'',
        ...this.options.watchOn.map((directory) => `watching: ${directory}`),
      ]);

      this._started = true;
    }
  }

  _onNodemonRestart(files) {
    if (!this.options.requiresTranspilation) {
      if (files && files.length) {
        const [file] = files;
        this.appLogger.warning(`Restarting because file was modified: ${file}`);
      } else {
        this.appLogger.warning('Restarting');
      }
    } else if (!files) {
      this.appLogger.warning('Restarting');
    }

    this._onNodemonStart(true);
  }

  _onNodemonCrash() {
    this.appLogger.error('Crash - waiting for file changes before starting...');
  }

  _onNodemonQuit() {
    if (this.options.requiresTranspilation) {
      this.watcher.close();
    }

    // eslint-disable-next-line no-process-exit
    process.exit();
  }

  _onFileChange(file) {
    this.appLogger.warning(`Restarting because file was modified: ${file}`);
    this._transpileFile(file);
  }

  _transpileFile(file) {
    const { sourcePath, executionPath } = this.options;
    let relative;
    if (file.startsWith(sourcePath)) {
      relative = file.substr(sourcePath.length);
    } else {
      relative = file.substr(executionPath.length);
    }

    try {
      this.buildTranspiler.transpileFileSync({
        source: path.join(sourcePath, relative),
        output: path.join(executionPath, relative),
      });

      this.appLogger.success('The file was successfully copied and transpiled');
    } catch (error) {
      this.appLogger.error('Error: The file couldn\'t be updated');
      this.appLogger.error(error);
      this._onNodemonCrash();
    }
  }
}

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
