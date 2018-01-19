const path = require('path');
const babel = require('babel-core');
const fs = require('fs-extra');
const glob = require('glob');
const { provider } = require('jimple');
/**
 * Manages the transpilation of target files using Babel.
 */
class BuildTranspiler {
  /**
   * Class constructor.
   * @param {BabelConfiguration}   babelConfiguration   To get a target Babel configuration.
   * @param {Logger}               appLogger            To print information messages after
   *                                                    transpiling files.
   * @param {PathUtils}            pathUtils            To build paths for targets files.
   * @param {ProjectConfiguration} projectConfiguration To read the project paths.
   * @param {Targets}              targets              To access targets information.
   */
  constructor(
    babelConfiguration,
    appLogger,
    pathUtils,
    projectConfiguration,
    targets
  ) {
    /**
     * A local reference for the `babelConfiguration` service.
     * @type {BabelConfiguration}
     */
    this.babelConfiguration = babelConfiguration;
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A local reference for the `projectConfiguration` service.
     * @type {ProjectConfiguration}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
  }
  /**
   * Transpile a target files for a given build type. This requires the target files to have been
   * previously copied to the distribution directory.
   * @param {Target} target    The target information.
   * @param {[type]} buildType Required in order to get the target entry file for that build type
   *                           and use that directory as reference of what it needs to be
   *                           transpiled.
   * @return {Promise<undefined,Error}
   */
  transpileTargetFiles(target, buildType) {
    const { paths } = this.projectConfiguration;
    // Get the target entry file for the given build type (on the distribution directory).
    const targetFile = this.pathUtils.join(
      paths.build,
      target.entry[buildType]
    );
    /**
     * Get the directory of the entry file.
     * @todo This will cause issues if the entry file is on a sub directory.
     */
    const targetPath = path.dirname(targetFile);
    // Find all the JS files on the directory.
    return this.findFiles(targetPath)
    .then((files) => {
      // Get the Babel configuration for the target.
      const babelConfig = this.babelConfiguration.getConfigForTarget(target);
      // Loop all the files and transpile them
      return Promise.all(files.map((file) => this.transpileFile(file, babelConfig)));
    })
    .then((files) => {
      this.appLogger.success('The following files have been successfully transpiled:');
      // Remove the absolute path and the first `/`
      const prefix = this.pathUtils.path.length + 1;
      // Log all the files that have been transpiled.
      files.forEach((file) => {
        const filepath = file.substr(prefix);
        this.appLogger.info(`> ${filepath}`);
      });
    })
    .catch((error) => {
      this.appLogger.error(
        `There was an error while transpiling the ${target.name} code`
      );
      return Promise.reject(error);
    });
  }
  /**
   * Transpile a file.
   * @param {String|Object} filepath         If used as a string, it's the path to the file to
   *                                         transpile; if used as an object, it should have
   *                                         `source` and `output` properties to define from where
   *                                         to where the file is transpiled.
   * @param {?Object}       [options=null]   The Babel configuration to use. If not defined, the
   *                                         method will try to find a target configuration using
   *                                         the path of the file.
   * @param {Boolean}       [writeFile=true] If `true`, it will write the transpile code,
   *                                         otherwise, it will return it on the promise.
   * @return {Promise<Object|String,Error>} If `writeFile` is true, the promise will resolve on
   *                                        an object with the keys `filepath` (the path where it
   *                                        was transpiled) and `code`; but if the parameter is
   *                                        `false`, the promise will resolve on a string with
   *                                        the path to the file.
   */
  transpileFile(filepath, options = null, writeFile = true) {
    let from = '';
    let to = '';
    /**
     * Check if the file is a string or an object and define the from where to where the
     * transpilation should happen.
     */
    if (typeof filepath === 'string') {
      from = filepath;
      to = filepath;
    } else {
      from = filepath.source;
      to = filepath.output;
    }
    // If no options were defined, try to get them from a target, using the path of the file.
    const babelOptions = options || this.getTargetConfigurationForFile(from);
    // First, transform the file with Babel.
    const firstStep = new Promise((resolve, reject) => {
      babel.transformFile(from, babelOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.code);
        }
      });
    });

    let result;
    // If the file should be written...
    if (writeFile) {
      result = firstStep
      // ...write the file.
      .then((code) => fs.writeFile(to, code))
      // And return the path to the transpiled file.
      .then(() => to);
    } else {
      result = firstStep
      // Return the code and the path it should've been saved.
      .then((code) => ({ filepath: to, code }));
    }

    return result;
  }
  /**
   * Synchronous version of `transpileFile`.
   * @param {String|Object} filepath         If used as a string, it's the path to the file to
   *                                         transpile; if used as an object, it should have
   *                                         `source` and `output` properties to define from where
   *                                         to where the file is transpiled.
   * @param {?Object}       [options=null]   The Babel configuration to use. If not defined, the
   *                                         method will try to find a target configuration using
   *                                         the path of the file.
   * @param {Boolean}       [writeFile=true] If `true`, it will write the transpile code,
   *                                         otherwise, it will return it.
   * @return {Object|String} If `writeFile` is true, it will return an object with the keys
   *                         `filepath` (the path where it was transpiled) and `code`; but if the
   *                         parameter is `false`, it will return a string with the path to the
   *                         file.
   */
  transpileFileSync(filepath, options = null, writeFile = true) {
    let from = '';
    let to = '';
    /**
     * Check if the file is a string or an object and define the from where to where the
     * transpilation should happen.
     */
    if (typeof filepath === 'string') {
      from = filepath;
      to = filepath;
    } else {
      from = filepath.source;
      to = filepath.output;
    }

    // If no options were defined, try to get them from a target, using the path of the file.
    const babelOptions = options || this.getTargetConfigurationForFile(from);
    // First, transform the file with Babel.
    const { code } = babel.transformFileSync(from, babelOptions);
    let result;

    // If the file should be written...
    if (writeFile) {
      // ...write the file.
      fs.writeFileSync(to, code);
      // And set to return the path to the transpiled file.
      result = to;
    } else {
      // Set to return the code and the path it should've been saved.
      result = { filepath: to, code };
    }

    return result;
  }
  /**
   * Find files of a given type on a directory.
   * @param {String} directory                 The directory where the files will be searched for.
   * @param {String} [pattern='**\/*.{js,jsx}'] A glob pattern to match the files.
   * @return {Promise<Array,Error>} If everything goes well, the promise will resolve on the list
   *                                of files found.
   */
  findFiles(directory, pattern = '**/*.{js,jsx}') {
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: directory }, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files.map((file) => path.join(directory, file)));
        }
      });
    });
  }
  /**
   * Get a target Babel configuration based on a filepath.
   * @param {String} file The file that will be used to obtain the target and then the Babel
   *                      configuration.
   * @return {Object}
   * @throws {Error} If no target can be found.
   */
  getTargetConfigurationForFile(file) {
    // Find target using the received filepath.
    const target = this.targets.findTargetForFile(file);
    // If no target was found...
    if (!target) {
      throw new Error(`A target couldn't be find for the following file: ${file}`);
    }
    // Return the Babel configuration for the found target.
    return this.babelConfiguration.getConfigForTarget(target);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildTranspiler` as the `buildTranspiler` service.
 * @example
 * // Register is on the container
 * container.register(buildTranspiler);
 * // Getting access to the service instance
 * const buildTranspiler = container.get('buildTranspiler');
 * @type {Provider}
 */
const buildTranspiler = provider((app) => {
  app.set('buildTranspiler', () => new BuildTranspiler(
    app.get('babelConfiguration'),
    app.get('appLogger'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('targets')
  ));
});

module.exports = {
  BuildTranspiler,
  buildTranspiler,
};
