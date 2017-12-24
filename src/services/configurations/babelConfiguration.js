const { provider } = require('jimple');

class BabelConfiguration {
  constructor(events) {
    this.events = events;
    this.plugins = {
      properties: 'transform-class-properties',
      decorators: 'transform-decorators-legacy',
    };
  }

  getConfigForTarget(target) {
    const {
      babel: {
        features,
        nodeVersion,
        browserVersions,
        mobileSupport,
        overwrites,
      },
      flow,
    } = target;
    const config = Object.assign({}, overwrites || {});
    const presets = config.presets || [];
    const plugins = config.plugins || [];
    const hasEnv = presets
    .find((preset) => (Array.isArray(preset) && preset[0] === 'env'));

    if (!hasEnv) {
      const presetTargets = {};
      if (target.is.browser) {
        const browsers = ['chrome', 'safari', 'edge', 'firefox'];
        if (mobileSupport) {
          browsers.push(...['ios', 'android']);
        }

        presetTargets.browsers = browsers
        .map((browser) => `last ${browserVersions} ${browser} versions`);
      } else {
        presetTargets.node = nodeVersion;
      }

      presets.unshift(['env', { targets: presetTargets }]);
    }

    Object.keys(features).forEach((feature) => {
      const featurePlugin = this.features[feature];
      if (!plugins.include(featurePlugin)) {
        plugins.push(featurePlugin);
      }
    });

    if (flow) {
      presets.push(['flow']);
      if (!plugins.includes(this.features.properties)) {
        plugins.push(this.features.properties);
      }
    }

    config.presets = presets;
    config.plugins = plugins;
    return this.events.reduce('babel-configuration', config, target);
  }
}

const babelConfiguration = provider((app) => {
  app.set('babelConfiguration', () => new BabelConfiguration(
    app.get('events')
  ));
});

module.exports = {
  BabelConfiguration,
  babelConfiguration,
};
