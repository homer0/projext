const Jimple = require('jimple');
const appPackage = require('../../package.json');

const {
  environmentUtils,
  errorHandler,
  appLogger,
  packageInfo,
  pathUtils,
} = require('wootils/node/providers');

const {
  cleaner,
  copier,
  events,
  plugins,
  versionUtils,
} = require('../services/common');

const {
  buildCleaner,
  buildCopier,
  buildEngines,
  buildTranspiler,
  builder,
  targets,
} = require('../services/building');

const {
  cli,
  cliBuildCommand,
  cliCleanCommand,
  cliCopyProjectFilesCommand,
  cliRevisionCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHTranspileCommand,
} = require('../services/cli');

const {
  babelConfiguration,
  projectConfiguration,
  targetConfiguration,
} = require('../services/configurations');

class Woopack extends Jimple {
  constructor() {
    super();

    this.set('info', () => appPackage);

    this.register(environmentUtils);
    this.register(errorHandler);
    this.register(appLogger);
    this.register(packageInfo);
    this.register(pathUtils);

    this.register(cleaner);
    this.register(copier);
    this.register(events);
    this.register(plugins('woopack-plugin'));
    this.register(versionUtils);

    this.register(buildCleaner);
    this.register(buildCopier);
    this.register(buildEngines);
    this.register(buildTranspiler);
    this.register(builder);
    this.register(targets);

    this.register(cli);
    this.register(cliBuildCommand);
    this.register(cliCleanCommand);
    this.register(cliCopyProjectFilesCommand);
    this.register(cliRevisionCommand);
    this.register(cliSHBuildCommand);
    this.register(cliSHCopyCommand);
    this.register(cliSHTranspileCommand);

    this.register(babelConfiguration);
    this.register(projectConfiguration);
    this.register(targetConfiguration);

    this._loadPlugins();
    this._addErrorHandler();
  }

  cli() {
    this.get('cli').start([
      this.get('cliBuildCommand'),
      this.get('cliCleanCommand'),
      this.get('cliCopyProjectFilesCommand'),
      this.get('cliRevisionCommand'),
      this.get('cliSHBuildCommand'),
      this.get('cliSHCopyCommand'),
      this.get('cliSHTranspileCommand'),
    ]);
  }

  _loadPlugins() {
    this.get('plugins').load();
  }

  _addErrorHandler() {
    this.get('errorHandler').listen();
  }
}

module.exports = { Woopack };
