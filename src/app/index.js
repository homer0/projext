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

const webpackPlugin = require('../webpack/src');

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
    this.register(versionUtils);

    this.register(babelConfiguration);
    this.register(projectConfiguration);
    this.register(targetConfiguration);

    this.register(nodeTranspiler);

    webpackPlugin(this);
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
}

module.exports = Woopack;
