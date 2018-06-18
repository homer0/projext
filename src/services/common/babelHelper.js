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
   * exist, the method will create it.
   * @param {Object}       configuration The configuration to update.
   * @param {string|Array} plugin        A plugin name or configuration `Array` (`[name, options]`),
   *                                     or a list of them.
   * @return {Object} The updated configuration.
   */
  static addPlugin(configuration, plugin) {
    return this._addConfigurationItem(configuration, plugin, 'plugins');
  }
  /**
   * Adds a preset or a list of them to a Babel configuration. If the `presets` option doesn't
   * exist, the method will create it.
   * @param {Object}       configuration The configuration to update.
   * @param {string|Array} preset        A plugin name or configuration `Array` (`[name, options]`),
   *                                     or a list of them.
   * @return {Object} The updated configuration.
   */
  static addPreset(configuration, preset) {
    return this._addConfigurationItem(configuration, preset, 'presets');
  }
  /**
   * Update the options of the `env` preset on a Babel configuration. If the `presets` option
   * doesn't exist, it will create one and add the preset. If `presets` exists and there's
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
  /**
   * This is a helper method for adding things that share the same structure on a Babel
   * configuration, like plugins and presets: They can be a `string` with the plugin/preset name
   * or an `Array` with the name and its options.
   * @param {Object}       configuration The configuration to update.
   * @param {string|Array} item          An item name or configuration `Array` (`[name, options]`),
   *                                     or a list of them.
   * @param {string}       property      The name of the items property (like `plugins` or
   *                                     `presets`).
   * @return {Object} The updated configuration.
   * @access protected
   * @ignore
   */
  static _addConfigurationItem(configuration, item, property) {
    let singleItem = true;
    if (Array.isArray(item)) {
      const [itemName, itemOptions] = item;
      const itemAndOptionsLength = 2;
      if (
        item.length !== itemAndOptionsLength ||
        typeof itemName !== 'string' ||
        Array.isArray(itemOptions) ||
        typeof itemOptions !== 'object'
      ) {
        singleItem = false;
      }
    }

    // Normalize the received `item` parameter into an `Array`.
    const items = singleItem ? [item] : item;
    // Get a new reference for the configuration.
    const updatedConfiguration = Object.assign({}, configuration);
    // Define the variable for the list where the new plugin(s) will be added.
    let newItemsList;
    /**
     * Define a variable that may contain a list of the existing items' names. The reason for
     * this is that when adding new items (like presets or plugins), the method can validate if
     * they already are on the list by calling `.includes`; otherwise, and because most of Babel
     * items can be either a `string` or an `Array` (`[name, options]`), it would have to do a
     * `.some` or `.find` with a callback that checks the type of the existing item.
     */
    let existingItems;
    // If the configuration already has a property for the items...
    if (updatedConfiguration[property]) {
      // ...set the existing list as the one where the new items are going to be added.
      newItemsList = updatedConfiguration[property];
      // And generate a list with the names of the existing items.
      existingItems = newItemsList.map((existingItem) => (
        (Array.isArray(existingItem) ? existingItem[0] : existingItem)
      ));
    } else {
      // ...otherwise, set a empty list.
      newItemsList = [];
    }
    // Loop all the items that should be added.
    items.forEach((itemInfo) => {
      // Get the item name.
      const name = Array.isArray(itemInfo) ? itemInfo[0] : itemInfo;
      /**
       * If the configuration didn't have the required items property, or the item is not on the
       * list...
       */
      if (!existingItems || !existingItems.includes(name)) {
        // ...add it to the list.
        newItemsList.push(itemInfo);
      }
    });

    // Replace the items property on the configuration with the updated list.
    updatedConfiguration[property] = newItemsList;
    // Return the updated configuration.
    return updatedConfiguration;
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
