const { provider } = require('jimple');

class WebpackBuildEngine {
  constructor(webpackConfiguration) {
    this.webpackConfiguration = webpackConfiguration;
  }

  getCommand() {
    return 'woopack-webpack';
  }

  getConfiguration(target, buildType) {
    return this.webpackConfiguration.buildConfiguration(target, buildType);
  }
}

const webpackBuildEngine = provider((app) => {
  app.set('webpackBuildEngine', () => new WebpackBuildEngine(app.get('webpackConfiguration')));
});

module.exports = {
  WebpackBuildEngine,
  webpackBuildEngine,
};
