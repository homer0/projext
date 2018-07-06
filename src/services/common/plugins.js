const path = require('path');
const { provider } = require('jimple');
/**
 * This service is in charge of looking for, loading and registering plugins for the app.
 */
class Plugins {
  /**
   * Class constructor.
   * @param {string}    prefix      The prefix the dependencies need to have in order to be
   *                                identified as plugins.
   * @param {Projext}   app         To send to the plugis so they can register their services.
   * @param {Logger}    appLogger   To indicate if a plugin couldn't be loaded.
   * @param {Object}    packageInfo To read the dependencies list.
   * @param {PathUtils} pathUtils   To build the dependencies paths.
   */
  constructor(prefix, app, appLogger, packageInfo, pathUtils) {
    /**
     * The prefix the dependencies need to have in order to be identified as plugins.
     * @type {string}
     */
    this.prefix = prefix;
    /**
     * The local reference to the main app.
     * @type {Projext}
     */
    this.app = app;
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * The implementation `package.json`
     * @type {Object}
     */
    this.packageInfo = packageInfo;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * After the plugins are loaded, this property will have a list with the plugins names.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._loadedPlugins = [];
  }
  /**
   * Search for plugins on the `package.json` and loads them.
   * @param  {boolean} [dependencies=true]    Whether or not to look for plugins on the
   *                                          `dependencies`.
   * @param  {boolean} [devDependencies=true] Whether or not to look for plugins on the
   *                                          `devDependencies`.
   */
  load(dependencies = true, devDependencies = true) {
    const packages = [];
    if (dependencies && this.packageInfo.dependencies) {
      packages.push(...Object.keys(this.packageInfo.dependencies));
    }

    if (devDependencies && this.packageInfo.devDependencies) {
      packages.push(...Object.keys(this.packageInfo.devDependencies));
    }

    packages
    .filter((name) => name.startsWith(this.prefix))
    .forEach((name) => this._loadPlugin(name));
  }
  /**
   * Loads a plugin from a file relative to the project root directory.
   * @param {string} filePath The path to the file.
   */
  loadFromFile(filePath) {
    this._loadPluginFile(
      filePath,
      path.basename(filePath),
      this.pathUtils.join(filePath)
    );
  }
  /**
   * Gets the names of the loaded plugins.
   * @return {string}
   */
  getLoadedPlugins() {
    return this._loadedPlugins;
  }
  /**
   * Checks whether a plugin was loaded or not.
   * @param {string} name The plugin's name.
   * @return {boolean}
   */
  loaded(name) {
    return this.getLoadedPlugins().includes(name);
  }
  /**
   * Loads a plugin by its package name.
   * @param {string} packageName The name of the plugin.
   * @ignore
   * @access protected
   */
  _loadPlugin(packageName) {
    this._loadPluginFile(
      packageName,
      packageName.substr(this.prefix.length),
      this.pathUtils.join('node_modules', packageName)
    );
  }
  /**
   * Loads a plugin form an specific file.
   * @param {string} reference A name for the plugin to show in case the plugin can't be loaded.
   *                           In the case of a plugin from the `node_modules`, it should be the
   *                           package name; on any other case, it should be the file path.
   * @param {string} name      The name the service will use to save it on the list of loaded
   *                           plugins.
   * @param {string} filepath  The path to the file to `require`.
   * @throws {Error} If the plugin can't be loaded or registered.
   * @ignore
   * @access protected
   */
  _loadPluginFile(reference, name, filepath) {
    try {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      const plugin = require(filepath);
      if (plugin.plugin && typeof plugin.plugin === 'function') {
        plugin.plugin(this.app);
      } else {
        plugin(this.app);
      }
    } catch (error) {
      this.appLogger.error(`The plugin ${reference} couldn't be loaded`);
      throw error;
    }

    this._loadedPlugins.push(name);
  }
}
/**
 * Generate a `Provider` with an already defined prefix for the plugins.
 * @example
 * // Generate the provider
 * const provider = plugins('my-plugin-');
 * // Register it on the container
 * container.register(provider);
 * // Getting access to the service instance
 * const plugins = container.get('plugins');
 * @param {string} prefix The prefix the dependencies need to have in order to
 *                        be identified as plugins.
 * @return {Provider}
 */
const plugins = (prefix) => provider((app) => {
  app.set('plugins', () => new Plugins(
    prefix,
    app,
    app.get('appLogger'),
    app.get('packageInfo'),
    app.get('pathUtils')
  ));
});

module.exports = {
  Plugins,
  plugins,
};
