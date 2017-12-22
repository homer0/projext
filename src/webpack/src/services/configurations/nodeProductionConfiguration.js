const webpackNodeUtils = require('webpack-node-utils');
const {
  NoEmitOnErrorsPlugin,
} = require('webpack');
const { provider } = require('jimple');
const ConfigurationFile = require('../../../interfaces/configurationFile');

class WebpackNodeProductionConfiguration extends ConfigurationFile {
  constructor(
    events,
    pathUtils,
    projectConfiguration,
    webpackBaseConfiguration
  ) {
    super(
      pathUtils,
      'webpack/node.production.config.js',
      true,
      webpackBaseConfiguration
    );
    this.events = events;
    this.projectConfiguration = projectConfiguration;
  }

  createConfig(params) {
    const { entry, target } = params;

    const config = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: '[name].js',
        publicPath: '/',
      },
      plugins: [
        new NoEmitOnErrorsPlugin(),
      ],
      target: 'node',
      node: {
        __dirname: false,
      },
      externals: webpackNodeUtils.externals(),
    };

    return this.events.reduce(
      'webpack-node-production-configuration',
      config,
      params
    );
  }
}

const webpackNodeProductionConfiguration = provider((app) => {
  app.set(
    'webpackNodeProductionConfiguration',
    () => new WebpackNodeProductionConfiguration(
      app.get('events'),
      app.get('pathUtils'),
      app.get('projectConfiguration').getConfig(),
      app.get('webpackBaseConfiguration')
    )
  );
});

module.exports = {
  WebpackNodeProductionConfiguration,
  webpackNodeProductionConfiguration,
};
