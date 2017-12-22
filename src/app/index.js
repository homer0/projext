const Jimple = require('jimple');

const {
  environmentUtils,
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
    this.register(appLogger);
    this.register(packageInfo);
    this.register(pathUtils);

    this.register(cleaner);
    this.register(copier);
    this.register(events);
    this.register(plugins);
    this.register(versionUtils);

    this.register(babelConfiguration);
    this.register(projectConfiguration);
    this.register(targetConfiguration);

    this.register(nodeTranspiler);

    this._loadPlugins();
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

  _loadPlugins() {
    this.get('plugins').load();
  }
}

module.exports = Woopack;
