const { provider } = require('jimple');
const ConfigurationFile = require('../../../interfaces/configurationFile');

class WebpackBaseConfiguration extends ConfigurationFile {
  constructor(
    events,
    pathUtils,
    projectConfiguration,
    webpackLoadersConfiguration
  ) {
    super(pathUtils, 'webpack/base.config.js');
    this.events = events;
    this.projectConfiguration = projectConfiguration;
    this.webpackLoadersConfiguration = webpackLoadersConfiguration;
  }

  createConfig(params) {
    const rules = this.webpackLoadersConfiguration.getConfig(params);
    const config = {
      resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['./', 'node_modules'],
      },
      module: {
        rules,
      },
    };

    const eventName = params.target.is.node ?
      'webpack-base-configuration-for-node' :
      'webpack-base-configuration-for-browser';

    return this.events.reduce(eventName, config, params);
  }
}

const webpackBaseConfiguration = provider((app) => {
  app.set('webpackBaseConfiguration', () => new WebpackBaseConfiguration(
    app.get('events'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('webpackLoadersConfiguration')
  ));
});

module.exports = {
  WebpackBaseConfiguration,
  webpackBaseConfiguration,
};
