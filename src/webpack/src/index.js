const {
  webpackConfiguration,
} = require('./services/building');

const {
  webpackBaseConfiguration,
  webpackBrowserDevelopmentConfiguration,
  webpackBrowserProductionConfiguration,
  webpackLoadersConfiguration,
  webpackNodeDevelopmentConfiguration,
  webpackNodeProductionConfiguration,
} = require('./services/configurations');

module.exports = (app) => {
  app.register(webpackConfiguration);

  app.register(webpackBaseConfiguration);
  app.register(webpackBrowserDevelopmentConfiguration);
  app.register(webpackBrowserProductionConfiguration);
  app.register(webpackLoadersConfiguration);
  app.register(webpackNodeDevelopmentConfiguration);
  app.register(webpackNodeProductionConfiguration);
};
