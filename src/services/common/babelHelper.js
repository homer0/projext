const { provider } = require('jimple');

/**
 * @typedef {function} UpdateEnvPresetFunction
 * @param {Object} options The current options of the `env` preset.
 * @return {Object} The updated options for the `env` preset.
 */

/**
 * A set of utilities to easily modify a Babel configuration.
 */
class BabelHelper {
  /**
   * Adds a plugin or a list of them to a Babel configuration. If the `plugins` option doesn't
   * exists it creates it.
   * @param {Object}       configuration The configuration to update.
   * @param {string|Array} plugin        A plugin name or configuration `Array` (`[name, options]`),
   *                                     or a list of them.
   * @return {Object} The updated configuration.
   */
  static addPlugin(configuration, plugin) {
    // Get a new reference for the configuration.
    const updatedConfiguration = Object.assign({}, configuration);
    // Normalize the received `plugin` parameter into an `Array`.
    const plugins = Array.isArray(plugin) ? plugin : [plugin];
    // Define the variable for the list where the new plugin(s) will be added.
    let newPluginsList;
    /**
     * Define a variable that may contain a list of the existing plugins' names. The reason for
     * this is that when adding new plugins, the method can validate if they already are on the
     * list by calling `.includes` on this list; otherwise, and because plugins can be either a
     * `string` or an `Array`, it would have to do a `.some` or `.find` with a callback that checks
     * the type of the existing plugin.
     */
    let existingPlugins;
    // If the configuration already has plugins...
    if (updatedConfiguration.plugins) {
      // ...set the existing plugins list as the one where the new plugins are going to be added.
      newPluginsList = updatedConfiguration.plugins;
      // And generate a list with the names of the existing plugins.
      existingPlugins = newPluginsList.map((existingPlugin) => (
        (Array.isArray(existingPlugin) ? existingPlugin[0] : existingPlugin)
      ));
    } else {
      // ...otherwise, set a empty list.
      newPluginsList = [];
    }
    // Loop all the plugins that should be added.
    plugins.forEach((pluginInfo) => {
      // Get the plugin name.
      const name = Array.isArray(pluginInfo) ? pluginInfo[0] : plugin;
      // If the configuration didn't have plugins, or the plugin is not on the list.
      if (!existingPlugins || !existingPlugins.includes(name)) {
        // ...add it to the list.
        newPluginsList.push(pluginInfo);
      }
    });

    // Replace the `plugins` property on the configuration with the updated list.
    updatedConfiguration.plugins = newPluginsList;
    // Return the updated configuration.
    return updatedConfiguration;
  }
  /**
   * Update the options of the `env` preset on a Babel configuration. If the `presets` option
   * doesn't exists, it will create one and add the preset. If `presets` exists and there's
   * already an `env` preset, it will update it. But if `presets` exists but there's no `env`
   * preset, it won't do anything.
   * @param {Object}                  configuration The configuration to update.
   * @param {UpdateEnvPresetFunction} updateFn      The function called in order to update the
   *                                                `env` preset options.
   * @return {Object} The updated configuration.
   */
  static updateEnvPreset(configuration, updateFn) {
    // Get a new reference for the configuration.
    const updatedConfiguration = Object.assign({}, configuration);
    /**
     * Define a flag that will eventually indicate whether the configuration needs the `presets`
     * option or not.
     */
    let needsPresets = false;
    // Define a flag that will eventually tell if the configuration has the `env` preset or not.
    let hasEnvPreset = false;
    /**
     * Define the variable that, if the configuration has an `env` preset, indicate the index of
     * the preset on the list.
     */
    let envPresetIndex = -1;
    // Define the name of `env` preset; to avoid having the string on multiple places.
    const envPresetName = 'env';
    // If the configuration has presets...
    if (updatedConfiguration.presets && updatedConfiguration.presets.length) {
      // ...get the index of the `env` preset.
      envPresetIndex = updatedConfiguration.presets.findIndex((preset) => {
        const [presetName] = preset;
        return presetName === envPresetName;
      });
      // Set the value of the flag that indicates if the `env` preset exists.
      hasEnvPreset = envPresetIndex > -1;
    } else {
      // ...otherwise, set the flag that indicates the configuration doesn't have presets.
      needsPresets = true;
    }
    /**
     * This is the important part: Only proceed with the update if the configuration doesn't have
     * presets or if it already has an `env` preset.
     * If the configuration already has a list of presets that doesn't include the `env` preset,
     * then it's probably a custom setup and adding it may cause conflicts.
     */
    if (needsPresets) {
      /**
       * Invoke the callback with an empty dictionary and add a new `presets` options with just the
       * `env` preset.
       */
      updatedConfiguration.presets = [
        [envPresetName, updateFn({})],
      ];
    } else if (hasEnvPreset) {
      /**
       * If the `env` preset already existed, invoke the callback with the current options in order
       * to get new ones, define a new `env` preset and replace it on the list.
       */
      const [, currentEnvPresetOptions] = updatedConfiguration.presets[envPresetIndex];
      updatedConfiguration.presets[envPresetIndex] = [
        envPresetName,
        updateFn(currentEnvPresetOptions),
      ];
    }
    // Return the updated configuration.
    return updatedConfiguration;
  }
  /**
   * Add a required feature to the `env` preset options (it will go on the `include` option).
   * @param {Object}       configuration The configuration to update.
   * @param {string|Array} feature       The name of the feature to add or a list of them.
   * @return {Object} The updated configuration.
   */
  static addEnvPresetFeature(configuration, feature) {
    // Call the method to update the `env` preset options.
    return this.updateEnvPreset(configuration, (options) => {
      // Normalize the received `feature` parameter into an `Array`.
      const features = Array.isArray(feature) ? feature : [feature];
      // Generate a new reference for the options.
      const updatedOptions = Object.assign({}, options);
      // If the options already include a list of required features...
      if (updatedOptions.include) {
        // ...push only those that are not already present.
        updatedOptions.include.push(
          ...features.filter((name) => !updatedOptions.include.includes(name))
        );
      } else {
        // ...otherwise, copy the entire list of features into the option.
        updatedOptions.include = features.slice();
      }

      // Return the updated options.
      return updatedOptions;
    });
  }
  /**
   * Disable the `env` preset `modules` option as it may cause conflict with some packages.
   * @param {Object} configuration The configuration to update.
   * @return {Object} The updated configuration.
   */
  static disableEnvPresetModules(configuration) {
    // Call the method to update the `env` preset options.
    return this.updateEnvPreset(
      configuration,
      // Return an updated dictionary of options with `modules` disabled.
      (options) => Object.assign({}, options, { modules: false })
    );
  }
}
/**
 * The service provider that once registered on the app container will set a reference of
 * `BabelHelper` as the `babelHelper` service.
 * @example
 * // Register it on the container
 * container.register(babelHelper);
 * // Getting access to the service reference
 * const babelHelper = container.get('babelHelper');
 * @type {Provider}
 */
const babelHelper = provider((app) => {
  app.set('babelHelper', () => BabelHelper);
});

module.exports = {
  BabelHelper,
  babelHelper,
};
