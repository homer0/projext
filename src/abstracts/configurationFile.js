const fs = require('fs-extra');
const extend = require('extend');
const path = require('path');
/**
 * A helper class for creating configuration files that can be overwritten on
 * implementation.
 * @abstract
 * @version 1.0
 */
class ConfigurationFile {
  /**
   * Class constructor.
   * @param {PathUtils}         pathUtils            To build the path to the overwrite file.
   * @param {string|Array}      overwritePaths       A path of a list of paths for files that can
   *                                                 overwrite the configuration. If used as a
   *                                                 string, it will assume the path is inside
   *                                                 the `config` folder, but if used as a list, the
   *                                                 paths will be relative to the project root
   *                                                 directory.
   *                                                 If used as an array, the class will use the
   *                                                 first file of the list that exists and ignore
   *                                                 the rest.
   * @param {boolean}           [asFactory=false]    If `true`, every time `getConfig` gets called,
   *                                                 the configuration will be created again,
   *                                                 instead of caching it the first time it's
   *                                                 created.
   * @param {?ConfigurationFile} [parentConfig=null] If this parameter is used, the configuration
   *                                                 created by the instance will be merged on top
   *                                                 of the configuration returned by the
   *                                                 `getConfig` method of the parent configuration.
   * @throws {TypeError} If instantiated directly.
   * @abstract
   */
  constructor(pathUtils, overwritePaths, asFactory = false, parentConfig = null) {
    if (new.target === ConfigurationFile) {
      throw new TypeError(
        'ConfigurationFile is an abstract class, it can\'t be instantiated directly'
      );
    }
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A list of paths that can overwrite the configuration.
     * @type {Array}
     */
    this.overwritePaths = (typeof overwritePaths === 'string') ?
      [path.join('config', overwritePaths)] :
      (overwritePaths || []);
    /**
     * Whether the configuration should be created every time `getConfig` gets called or not.
     * @type {boolean}
     */
    this.asFactory = asFactory;
    /**
     * A parent configuration to extend.
     * @type {?ConfigurationFile}
     */
    this.parentConfig = parentConfig;
    /**
     * This will store the configuration after creating it.
     * @type {?Object}
     * @ignore
     * @access protected
     */
    this._config = null;
    /**
     * A flag to know if the overwrite file has been loaded or not.
     * @type {boolean}
     * @ignore
     * @access protected
     */
    this._fileConfigLoaded = false;
    /**
     * A function that eventually will return the changes from the overwrite file. Once the file
     * is loaded, if the file exports a function, then it will replace this variable, otherwise, the
     * return value of this method will be become the exported configuration.
     * @return {Object}
     * @ignore
     * @access protected
     */
    this._fileConfig = () => ({});
  }
  /**
   * This method will be called the first time `getConfig` gets called (or every time, depending on
   * the value of the `asFactory` property) and it should return the configuration contents.
   * As parameters, it will return the same ones sent to `getConfig`.
   * @example
   * // Let's say the class receives this call: `getConfig({ name: 'Charito'}, 'hello')`, you could
   * // do something like this:
   * createConfig(options, prefix) {
   *   return { message: `${prefix} ${options.name}` };
   * }
   * // And the configuration would be `{ message: 'hello Charito'}`
   * @throws {Error} if not overwritten.
   * @abstract
   */
  createConfig() {
    throw new Error('This method must to be overwritten');
  }
  /**
   * This is the public method all other services uses to obtain the configuration. If the
   * configuration doesn't exists or `asFactory` was set to `true` on the `constructor`, the
   * configuration will be reloaded.
   * @param  {Array} args A list of parameters for the service to use when creating the
   *                      configuration
   * @return {Object}
   */
  getConfig(...args) {
    if (!this._config || this.asFactory) {
      this._loadConfig(...args);
    }

    return this._config;
  }
  /**
   * This is the real method that creates the configuration.
   * @param  {Array} args A list of parameters for the service to use when creating the
   *                      configuration
   * @ignore
   * @access protected
   */
  _loadConfig(...args) {
    // If the overwrite file wasn't loaded yet...
    if (!this._fileConfigLoaded) {
      // ...turn on the flag that says it was loaded.
      this._fileConfigLoaded = true;
      // Call the method that loads the file.
      this._loadConfigFromFile();
    }

    let parentConfig = {};
    // If a parent configuration was defined on the constructor...
    if (this.parentConfig) {
      /**
       * Get its configuration by calling its `getConfig` method with the same parameters this
       * method received.
       */
      parentConfig = this.parentConfig.getConfig(...args);
    }
    // Define the current configuration using the parent one.
    let currentConfig = extend(true, {}, parentConfig);
    // Create a new set of arguments by adding the current configuration at the end.
    let currentArgs = [...args, currentConfig];
    // Update the current configuration by calling `createConfig` with the new arguments.
    currentConfig = extend(true, {}, currentConfig, this.createConfig(...currentArgs));
    // Update the arguments with the "new current configuration".
    currentArgs = [...args, currentConfig];
    // Finally, call the method for the overwrite file and merge everything together.
    this._config = extend(true, {}, currentConfig, this._fileConfig(...currentArgs));
  }
  /**
   * Load the configuration from an overwrite file.
   * @ignore
   * @access protected
   */
  _loadConfigFromFile() {
    const filepath = this.overwritePaths
    .map((overwrite) => this.pathUtils.join(overwrite))
    .find((overwrite) => fs.pathExistsSync(overwrite));
    // If there's a file...
    if (filepath) {
      // ...require it
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const overwriteContents = require(filepath);
      // If the file exported anything...
      if (overwriteContents) {
        // ...get the type of whatever the file exported.
        const overwriteType = typeof overwriteContents;
        // If the file exported a function...
        if (overwriteType === 'function') {
          // ...set it as the `_fileConfig` property.
          this._fileConfig = overwriteContents;
        } else {
          // ...otherwise, set the `_fileConfig` property to return whatever the file exported.
          this._fileConfig = () => overwriteContents;
        }
      }
    }
  }
}

module.exports = ConfigurationFile;
