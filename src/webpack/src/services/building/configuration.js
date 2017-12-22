const extend = require('extend');
const { provider } = require('jimple');

class WebpackConfiguration {
  constructor(
    projectConfiguration,
    versionUtils,
    targetConfiguration,
    webpackConfigurations
  ) {
    this.projectConfiguration = projectConfiguration;
    this.versionUtils = versionUtils;
    this.targetConfiguration = targetConfiguration;
    this.webpackConfigurations = webpackConfigurations;
  }

  getDefinitions(env) {
    return {
      'process.env.NODE_ENV': env,
    };
  }

  getHash() {
    const hash = Date.now();
    return {
      hash,
      hashStr: `.${hash}`,
    };
  }

  getVersion() {
    const { version: { revisionFilename } } = this.projectConfiguration;
    return this.versionUtils.getVersion(revisionFilename);
  }

  getLibraryOptions(target) {
    const { libraryOptions } = target;
    return Object.assign({
      libraryTarget: 'commonjs2',
    }, libraryOptions);
  }

  getConfig(target, buildType) {
    const targetType = target.type;
    if (!this.webpackConfigurations[targetType]) {
      throw new Error(`Theres's no configuration for the selected target type: ${targetType}`);
    } else if (!this.webpackConfigurations[targetType][buildType]) {
      throw new Error(`There's no configuration for the selected build type: ${buildType}`);
    }

    const { hash, hashStr } = this.getHash();
    const params = {
      target,
      entry: {
        [target.name]: [target.paths.source],
      },
      definitions: this.getDefinitions(buildType),
      version: this.getVersion(),
      hash,
      hashStr,
    };

    const config = this.targetConfiguration(
      `webpack/${target.name}.${buildType}.config.js`,
      this.webpackConfigurations[targetType][buildType]
    ).getConfig(params);
    config.output.path = this.pathUtils.join(config.output.path);

    if (target.library) {
      config.output = extend(true, {}, config.output, this.getLibraryOptions(target));
    }

    return config;
  }
}

const webpackConfiguration = provider((app) => {
  app.set('webpackConfiguration', () => {
    const webpackConfigurations = {
      node: {
        development: app.get('webpackNodeDevelopmentConfiguration'),
        production: app.get('webpackNodeProductionConfiguration'),
      },
      browser: {
        development: app.get('webpackBrowserDevelopmentConfiguration'),
        production: app.get('webpackBrowserProductionConfiguration'),
      },
    };

    return new WebpackConfiguration(
      app.get('projectConfiguration').getConfig(),
      app.get('versionUtils'),
      app.get('targetConfiguration'),
      webpackConfigurations
    );
  });
});

module.exports = {
  WebpackConfiguration,
  webpackConfiguration,
};
