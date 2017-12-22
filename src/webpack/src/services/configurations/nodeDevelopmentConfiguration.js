const webpackNodeUtils = require('webpack-node-utils');
const {
  NoEmitOnErrorsPlugin,
} = require('webpack');
const { provider } = require('jimple');
const ConfigurationFile = require('../../../interfaces/configurationFile');

class WebpackNodeDevelopmentConfiguration extends ConfigurationFile {
  constructor(
    events,
    pathUtils,
    projectConfiguration,
    webpackBaseConfiguration
  ) {
    super(
      pathUtils,
      'webpack/node.development.config.js',
      true,
      webpackBaseConfiguration
    );
    this.events = events;
    this.projectConfiguration = projectConfiguration;
  }

  createConfig(params) {
    const { entry, target } = params;

    let watch = false;
    const plugins = [
      new NoEmitOnErrorsPlugin(),
    ];

    if (target.run) {
      watch = true;
      plugins.push(new webpackNodeUtils.WebpackNodeUtilsRunner());
    }

    const config = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: '[name].js',
        publicPath: '/',
      },
      watch,
      plugins,
      target: 'node',
      node: {
        __dirname: false,
      },
      externals: webpackNodeUtils.externals({}, true),
    };

    return this.events.reduce(
      'webpack-node-development-configuration',
      config,
      params
    );
  }
}

const webpackNodeDevelopmentConfiguration = provider((app) => {
  app.set(
    'webpackNodeDevelopmentConfiguration',
    () => new WebpackNodeDevelopmentConfiguration(
      app.get('events'),
      app.get('pathUtils'),
      app.get('projectConfiguration').getConfig(),
      app.get('webpackBaseConfiguration')
    )
  );
});

module.exports = {
  WebpackNodeDevelopmentConfiguration,
  webpackNodeDevelopmentConfiguration,
};
