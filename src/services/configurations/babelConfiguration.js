const { provider } = require('jimple');
/**
 * This service is in charge of creating Babel configurations for targets.
 */
class BabelConfiguration {
  /**
   * Class constructor.
   * @param {Events} events To reduce the configurations.
   */
  constructor(events) {
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * A dictionary with familiar names for Babel plugins.
     * @type {Object}
     */
    this.plugins = {
      properties: '@babel/plugin-proposal-class-properties',
      decorators: '@babel/plugin-proposal-decorators',
    };
  }
  /**
   * Get a Babel configuration for a target.
   * This method uses the event reducer `babel-configuration`, which sends a Babel configuration
   * and a target information, and expects a Babel configuration on return.
   * @param {Target} target The target information.
   * @return {Object}
   */
  getConfigForTarget(target) {
    // Get the target settings we need
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
    // Define the configuration we are going to _'update'_.
    const config = Object.assign({}, overwrites || {});
    // Define the list of presets.
    const presets = config.presets || [];
    // Define the list of plugins.
    const plugins = config.plugins || [];
    // Define the name of `env` preset; to avoid having the string on multiple places.
    const envPresetName = '@babel/preset-env';
    // Check whether or not the presets include the `env` preset.
    const hasEnv = presets
    .find((preset) => (Array.isArray(preset) && preset[0] === envPresetName));

    // If it doesn't have the `env` preset...
    if (!hasEnv) {
      // ...define the preset targets depending on the target type.
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
      // Push the new `env` preset on top of the list.
      presets.unshift([envPresetName, { targets: presetTargets }]);
    }
    // Check if the configuration should include any _'known plugin'_.
    features.forEach((feature) => {
      const featurePlugin = this.plugins[feature];
      if (!plugins.includes(featurePlugin)) {
        plugins.push(featurePlugin);
      }
    });

    /**
     * Check if the target uses flow, which forces the configuration to use the `flow` preset and
     * the _'properties'_ plugin.
     */
    if (flow) {
      presets.push(['@babel/preset-flow']);
      if (!plugins.includes(this.plugins.properties)) {
        plugins.push(this.plugins.properties);
      }
    }

    // Set both presets and plugins back on the config.
    config.presets = presets;
    config.plugins = plugins;
    // Return a reduced configuration
    return this.events.reduce('babel-configuration', config, target);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BabelConfiguration` as the `babelConfiguration` service.
 * @example
 * // Register it on the container
 * container.register(babelConfiguration);
 * // Getting access to the service instance
 * const babelConfiguration = container.get('babelConfiguration');
 * @type {Provider}
 */
const babelConfiguration = provider((app) => {
  app.set('babelConfiguration', () => new BabelConfiguration(
    app.get('events')
  ));
});

module.exports = {
  BabelConfiguration,
  babelConfiguration,
};
