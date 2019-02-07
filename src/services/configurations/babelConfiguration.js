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
      classProperties: '@babel/plugin-proposal-class-properties',
      decorators: '@babel/plugin-proposal-decorators',
      dynamicImports: '@babel/plugin-syntax-dynamic-import',
      objectRestSpread: '@babel/plugin-proposal-object-rest-spread',
    };

    this._typesPresets = {
      flow: '@babel/preset-flow',
      typeScript: '@babel/preset-typescript',
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
      typeScript,
      framework,
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
    Object.keys(features).forEach((feature) => {
      if (features[feature] && this.plugins[feature]) {
        const featurePlugin = this.plugins[feature];
        if (!plugins.includes(featurePlugin)) {
          plugins.push(featurePlugin);
        }
      }
    });

    // Check if the target uses Flow or TypeScript.
    if (flow) {
      // Check and, if needed, add the Flow preset and the class properties plugin.
      if (!this._includesConfigurationItem(presets, this._typesPresets.flow)) {
        presets.push([this._typesPresets.flow]);
      }
      if (!this._includesConfigurationItem(plugins, this.plugins.classProperties)) {
        plugins.push(this.plugins.classProperties);
      }
    } else if (typeScript) {
      /**
       * Check and, if needed, add the TypeScript preset and the class properties and
       * object rest/spread plugins.
       */
      if (!this._includesConfigurationItem(presets, this._typesPresets.typeScript)) {
        const tsOptions = {};
        if (framework === 'react') {
          tsOptions.isTSX = true;
          tsOptions.allExtensions = true;
        }
        presets.push([this._typesPresets.typeScript, tsOptions]);
      }
      if (!this._includesConfigurationItem(plugins, this.plugins.classProperties)) {
        plugins.push(this.plugins.classProperties);
      }
      if (!this._includesConfigurationItem(plugins, this.plugins.objectRestSpread)) {
        plugins.push(this.plugins.objectRestSpread);
      }
    }

    // Set both presets and plugins back on the config.
    config.presets = presets;
    config.plugins = plugins;
    // Return a reduced configuration
    return this.events.reduce('babel-configuration', config, target);
  }
  /**
   * Checks if a plugin/preset exists on a Babel configuration property list. The reason of the
   * method is that, sometimes, the plugins or presets can be defined as array (first the name and
   * then the options), so it also needs to check for those cases.
   * @param {Array}  configurationList The list of presets or plugins where the function will look
   *                                   for the item.
   * @param {string} item              The name of the item the function needs to check for.
   * @return {boolean}
   * @access protected
   * @ignore
   */
  _includesConfigurationItem(configurationList, item) {
    return configurationList.length ?
      configurationList.find((element) => (
        Array.isArray(element) && element.length ?
          element[0] === item :
          element === item
      )) :
      false;
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
