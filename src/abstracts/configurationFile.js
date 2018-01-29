const fs = require('fs-extra');
const extend = require('extend');
/**
 * A helper class for creating configuration files that can be overwritten on
 * implementation.
 * @abstract
 */
class ConfigurationFile {
  /**
   * Class constructor.
   * @param {PathUtils}         pathUtils            To build the path to the overwrite file.
   * @param {string}            overwritePath        The path, inside the `config` folder, for the
   *                                                 file that can overwrite the configuration.
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
  constructor(pathUtils, overwritePath, asFactory = false, parentConfig = null) {
    if (new.target === ConfigurationFile) {
      throw new TypeError(
        'ConfigurationFile is an abstract class, it can\'t be instantiated directly'
      );
    }
    /**
     * A local reference to the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * The path, inside the `config` folder, for the file that can overwrite the configuration.
     * @type {string}
     */
    this.overwritePath = overwritePath;
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
     */
    this._config = null;
    /**
     * A flag to know if the overwrite file has been loaded or not.
     * @type {boolean}
     */
    this._fileConfigLoaded = false;
    /**
     * A function that eventually will return the changes from the overwrite file. Once the file
     * is loaded, if the file exports a function, then it will replace this variable, otherwise, the
     * return value of this method will be become the exported configuration.
     * @return {Object}
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
   * @return {Object}
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
    /**
     * Return the final configuration, which is a merge of the following things:
     * - The parent configuration `getConfig` method result; or an empty object if no parent
     * configuration was received.
     * - The result of this instance `createConfig` method.
     * - The contents of the overwrite file.
     */
    this._config = extend(
      true,
      {},
      parentConfig,
      this.createConfig(...args),
      this._fileConfig(...args)
    );
  }
  /**
   * Load the configuration from the overwrite file.
   * @ignore
   * @access protected
   */
  _loadConfigFromFile() {
    const filepath = this.pathUtils.join('config', this.overwritePath);
    let overwriteContents = null;
    // If the file exists...
    if (fs.pathExistsSync(filepath)) {
      // ...require it
      // eslint-disable-next-line global-require, import/no-dynamic-require
      overwriteContents = require(filepath);
    }
    // If the file exists and exported anything...
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

module.exports = ConfigurationFile;
