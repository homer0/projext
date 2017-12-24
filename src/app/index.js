const Jimple = require('jimple');

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
  builder,
  targets,
} = require('../services/building');

const {
  babelConfiguration,
  projectConfiguration,
  targetConfiguration,
} = require('../services/configurations');

const {
  nodeTranspiler,
} = require('../services/transpiler');

class Woopack extends Jimple {
  constructor() {
    super();

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
    this.register(builder);
    this.register(targets);

    this.register(babelConfiguration);
    this.register(projectConfiguration);
    this.register(targetConfiguration);

    this.register(nodeTranspiler);

    this._loadPlugins();
    this._addErrorHandler();
  }

  getConfigurationVars() {
    const envUtils = this.get('environmentUtils');
    const projectConfig = this.get('projectConfiguration').getConfig();
    const [firstTarget] = Object.keys(projectConfig.targets);
    return {
      target: envUtils.get('WOOPACK_BUILD_TARGET', firstTarget),
      type: envUtils.get('WOOPACK_BUILD_TYPE', 'development'),
    };
  }

  getBuildCommand(targetName, buildType) {
    return this.get('builder').getBuildCommand(targetName, buildType);
  }

  _loadPlugins() {
    this.get('plugins').load();
  }

  _addErrorHandler() {
    this.get('errorHandler').listen();
  }
}

module.exports = { Woopack };
