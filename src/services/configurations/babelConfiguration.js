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
     * @access protected
     * @ignore
     */
    this._plugins = {
      decorators: {
        name: '@babel/plugin-proposal-decorators',
        options: {
          legacy: true,
        },
      },
      classProperties: {
        name: '@babel/plugin-proposal-class-properties',
        options: {
          loose: true,
        },
      },
      dynamicImports: {
        name: '@babel/plugin-syntax-dynamic-import',
        options: {},
      },
      objectRestSpread: {
        name: '@babel/plugin-proposal-object-rest-spread',
        options: {},
      },
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
    // Get the target settings we need.
    const {
      babel: {
        features,
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
      // ... create an `env` preset for the target and add it to the top of the list.
      presets.unshift([envPresetName, this._createEnvPresetForTarget(target)]);
    }

    // Check if the configuration should include any _'known plugin'_.
    Object.keys(features).forEach((feature) => {
      if (features[feature] && this._plugins[feature]) {
        const featurePlugin = this._plugins[feature];
        if (!this._includesConfigurationItem(plugins, featurePlugin.name)) {
          if (Object.keys(featurePlugin.options).length) {
            plugins.push([featurePlugin.name, featurePlugin.options]);
          } else {
            plugins.push(featurePlugin.name);
          }
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
   * Creates a configuration for a Babel "env preset" using the settings from a target.
   * @param {Target} target The target information.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _createEnvPresetForTarget(target) {
    // Get the target settings we need.
    const {
      babel: {
        nodeVersion,
        browserVersions,
        mobileSupport,
        polyfill,
        env,
      },
    } = target;
    /**
     * If the target needs polyfills, use as base the settings for `core-js`, otherwise, just
     * use an empty object.
     */
    const presetBaseSettings = polyfill ? { corejs: 3, useBuiltIns: 'usage' } : {};
    /**
     * Merge an object with the required properties, the base generated after evaluating the need
     * for polyfills, and whatever was specified on the target settings.
     */
    const envPreset = Object.assign({ targets: {} }, presetBaseSettings, env);
    // If the target is for browsers...
    if (target.is.browser) {
      /**
       * Check if the target had settings for browsers, because if there are no settings, the
       * method will create new ones, if there was an array, the method will only add settings
       * for browsers that are not present; and if the value is `falsy`, it will delete the key.
       */
      const { targets: { browsers: currentBrowsers } } = envPreset;
      const currentBrowsersExists = Array.isArray(currentBrowsers);
      if (currentBrowsersExists || typeof currentBrowsers === 'undefined') {
        // Define the list of basic desktop browsers.
        const browsers = ['chrome', 'safari', 'edge', 'firefox'];
        // If the target needs transpilation for mobile, add the supported mobile browsers.
        if (mobileSupport) {
          browsers.push(...['ios', 'android']);
        }
        /**
         * Map the settings into dictionaries with the name of the browser the setting is for and
         * the value of the setting.
         */
        let browsersSettings = browsers.map((browser) => ({
          name: browser,
          setting: `last ${browserVersions} ${browser} versions`,
        }));

        // Define the variable for the new value of the setting.
        const newValue = [];
        /**
         * If there was a list of browser settings on the target, push it to the list that will be
         * used as the new value and remove the browsers that are already present.
         */
        if (currentBrowsersExists) {
          newValue.push(...currentBrowsers);
          browsersSettings = browsersSettings
          .filter((settings) => !currentBrowsers.some((line) => line.includes(settings.name)));
        }

        // Push the settings for the list of browsers generated by the method.
        newValue.push(...browsersSettings.map(({ setting }) => setting));
        // Overwrite the value of the setting.
        envPreset.targets.browsers = newValue;
      } else {
        // `browsers` was `falsy`, so it needs to be removed.
        delete envPreset.targets.browsers;
      }
    } else if (typeof envPreset.targets.node === 'undefined') {
      // Add the Node version if it's not already defined.
      envPreset.targets.node = nodeVersion;
    }

    return envPreset;
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
      this._plugins.classProperties.name
    )) {
      const { classProperties } = this._plugins;
      newConfig.plugins.push([classProperties.name, classProperties.options]);
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

    const toAdd = [];
    if (!this._includesConfigurationItem(
      currentConfiguration.plugins,
      this._plugins.classProperties.name
    )) {
      toAdd.push('classProperties');
    }

    if (!this._includesConfigurationItem(
      currentConfiguration.plugins,
      this._plugins.objectRestSpread.name
    )) {
      toAdd.push('objectRestSpread');
    }

    toAdd.forEach((feature) => {
      const featurePlugin = this._plugins[feature];
      if (Object.keys(featurePlugin.options).length) {
        newConfig.plugins.push([featurePlugin.name, featurePlugin.options]);
      } else {
        newConfig.plugins.push(featurePlugin.name);
      }
    });

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
