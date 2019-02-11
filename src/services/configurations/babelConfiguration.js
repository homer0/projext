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
    /**
     * A dictionary with familiar names for Babel presets for type check.
     * @type {Object}
     * @access protected
     * @ignore
     */
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
      const flowConfig = this._getFlowConfiguration({ presets, plugins });
      presets.push(...flowConfig.presets);
      plugins.push(...flowConfig.plugins);
    } else if (typeScript) {
      const tsConfig = this._getTypeScriptConfiguration({ presets, plugins }, framework);
      presets.push(...tsConfig.presets);
      plugins.push(...tsConfig.plugins);
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
  /**
   * This method will generate a list of presets and plugins needed to support Flow on a
   * given Babel configuration. To avoid modifying the reference of the current configuration or
   * generating a new one for overwriting, the method will generate two new lists that can be
   * pushed directly to the existing configuration.
   * @example
   * const flowConfig = this._getFlowConfiguration(currentConfig);
   * currentConfig.presets.push(...flowConfig.presets);
   * currentConfig.plugins.push(...flowConfig.plugins);
   * @param {Object} currentConfiguration         The configuration to validate.
   * @param {Array}  currentConfiguration.presets The current list of presets.
   * @param {Array}  currentConfiguration.plugins The current list of plugins.
   * @return {Object} And object with missing plugins and presets to achieve support for Flow.
   * @property {Array} presets The list of missing presets needed to support Flow.
   * @property {Array} plugins The list of missing presets needed to support Flow.
   * @access protected
   * @ignore
   */
  _getFlowConfiguration(currentConfiguration) {
    const newConfig = {
      presets: [],
      plugins: [],
    };

    if (!this._includesConfigurationItem(
      currentConfiguration.presets,
      this._typesPresets.flow
    )) {
      newConfig.presets.push([this._typesPresets.flow]);
    }

    if (!this._includesConfigurationItem(
      currentConfiguration.plugins,
      this.plugins.classProperties
    )) {
      newConfig.plugins.push(this.plugins.classProperties);
    }

    return newConfig;
  }
  /**
   * This method will generate a list of presets and plugins needed to support TypeScript on a
   * given Babel configuration. To avoid modifying the reference of the current configuration or
   * generating a new one for overwriting, the method will generate two new lists that can be
   * pushed directly to the existing configuration.
   * @example
   * const tsConfig = this._getTypeScriptConfiguration(currentConfig, framework);
   * currentConfig.presets.push(...tsConfig.presets);
   * currentConfig.plugins.push(...tsConfig.plugins);
   * @param {Object} currentConfiguration         The configuration to validate.
   * @param {Array}  currentConfiguration.presets The current list of presets.
   * @param {Array}  currentConfiguration.plugins The current list of plugins.
   * @param {String} framework                    To check for React and enable TSX support.
   * @return {Object} And object with missing plugins and presets to achieve support for TypeScript.
   * @property {Array} presets The list of missing presets needed to support TypeScript.
   * @property {Array} plugins The list of missing presets needed to support TypeScript.
   * @access protected
   * @ignore
   */
  _getTypeScriptConfiguration(currentConfiguration, framework) {
    const newConfig = {
      presets: [],
      plugins: [],
    };

    if (!this._includesConfigurationItem(
      currentConfiguration.presets,
      this._typesPresets.typeScript
    )) {
      const tsOptions = {};
      if (framework === 'react') {
        tsOptions.isTSX = true;
        tsOptions.allExtensions = true;
      }
      newConfig.presets.push([this._typesPresets.typeScript, tsOptions]);
    }

    if (!this._includesConfigurationItem(
      currentConfiguration.plugins,
      this.plugins.classProperties
    )) {
      newConfig.plugins.push(this.plugins.classProperties);
    }

    if (!this._includesConfigurationItem(
      currentConfiguration.plugins,
      this.plugins.objectRestSpread
    )) {
      newConfig.plugins.push(this.plugins.objectRestSpread);
    }

    return newConfig;
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
