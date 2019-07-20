const fs = require('fs-extra');
const ObjectUtils = require('wootils/shared/objectUtils');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { provider } = require('jimple');

/**
 * @typedef {Object} DotEnvUtilsFileInfo
 * @property {string} name The name of the file.
 * @property {string} path The absolute path of the file.
 * @ignore
 */

/**
 * A utility class/service to work with .env files for environment variables.
 */
class DotEnvUtils {
  /**
   * @param {EnvironmentUtils} environmentUtils To set variables in the environment.
   * @param {AppLogger}        appLogger        To log information messages when files are loaded
   *                                            or when there's a problem loading them.
   * @param {PathUtils}        pathUtils        To get paths relative to the project root.
   */
  constructor(environmentUtils, appLogger, pathUtils) {
    /**
     * A local reference for the `environmentUtils` service.
     * @type {EnvironmentUtils}
     * @access protected
     * @ignore
     */
    this._environmentUtils = environmentUtils;
    /**
     * A local reference for the `appLogger` service.
     * @type {AppLogger}
     * @access protected
     * @ignore
     */
    this._appLogger = appLogger;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     * @access protected
     * @ignore
     */
    this._pathUtils = pathUtils;
  }
  /**
   * Given a list of `.env` files (relative to the project root directory), this method will
   * validate if they exist, load them, merge them (if `extend` is `true`) and return an object
   * with all the variable declarations it found.
   * @param {Array}   files         The list of file names relative to the project root directory.
   * @param {boolean} [extend=true] Whether or not the variables found on the files should be
   *                                merged on a single object. If this is `true`, it will reverse
   *                                the list of files and merge all the variables in top of
   *                                each other (to ensure that the final overwrite is from the
   *                                file that was first on the list). If this is `false`, even
   *                                if multiple files were found, it will only use the first one.
   * @return {Object}
   * @property {boolean} loaded    Whether or not variables were loaded.
   * @property {Object}  variables A dictionary with all the loaded variables.
   */
  load(files, extend = true) {
    const filesInfo = files
    .map((file) => ({
      name: file,
      path: this._pathUtils.join(file),
    }))
    .filter((info) => fs.pathExistsSync(info.path));

    const result = {
      loaded: true,
      variables: {},
    };

    if (filesInfo.length) {
      const useFiles = extend ? filesInfo : [filesInfo[0]];
      result.variables = this._parseFiles(useFiles);
      result.loaded = !!Object.keys(result.variables).length;
    } else {
      result.loaded = false;
    }

    return result;
  }
  /**
   * Given a dictionary of variables, this method will inject all of them on the environment.
   * @param {Object}  variables        A dictionary with the variables to inject.
   * @param {boolean} [overwrite=true] If `true`, and a variable is already declared, it will
   *                                   overwrite it, otherwise, it will skip it.
   */
  inject(variables, overwrite = true) {
    Object.keys(variables).forEach((name) => {
      const value = variables[name];
      this._environmentUtils.set(name, value, overwrite);
    });
  }
  /**
   * Given a list of files, the method will reverse the list, load the variables from each file
   * and then merge them on top of each other. The reason the method first reverses the list is
   * so the files with higher priority (lower index) are merged on top of the ones with lower
   * priority (higher index). For example, `[fileOne, fileTwo]` will result on `fileOne` being
   * merged in top of `fileTwo`, because it was first on the list.
   * @param {Array} files A list of {@link DotEnvUtilsFileInfo} elements.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _parseFiles(files) {
    const parsed = files
    .reverse()
    .reduce(
      (current, fileInfo) => ObjectUtils.merge(current, this._parseFile(fileInfo)),
      {}
    );

    return dotenvExpand({ parsed }).parsed;
  }
  /**
   * Loads and parses a single environment file.
   * @param {DotEnvUtilsFileInfo} fileInfo The information for the file to load.
   * @return {Object} The variables from the file.
   * @throws {Error} If the file can't be read.
   * @access protected
   * @ignore
   */
  _parseFile(fileInfo) {
    let result;
    try {
      const contents = fs.readFileSync(fileInfo.path);
      result = dotenv.parse(contents);
      this._appLogger.success(`Environment file successfully loaded: ${fileInfo.name}`);
    } catch (error) {
      this._appLogger.error(`Error: The environment file couldn't be read: ${fileInfo.name}`);
      throw error;
    }

    return result;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `DotEnvUtils` as the `dotEnvUtils` service.
 * @example
 * // Register it on the container
 * container.register(dotEnvUtils);
 * // Getting access to the service instance
 * const dotEnvUtils = container.get('dotEnvUtils');
 * @type {Provider}
 */
const dotEnvUtils = provider((app) => {
  app.set('dotEnvUtils', () => new DotEnvUtils(
    app.get('environmentUtils'),
    app.get('appLogger'),
    app.get('pathUtils')
  ));
});

module.exports = {
  DotEnvUtils,
  dotEnvUtils,
};
