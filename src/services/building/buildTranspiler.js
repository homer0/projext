const path = require('path');
const babel = require('@babel/core');
const fs = require('fs-extra');
const glob = require('glob');
const { provider } = require('jimple');
/**
 * Manages the transpilation of target files using Babel.
 */
class BuildTranspiler {
  /**
   * Class constructor.
   * @param {BabelConfiguration} babelConfiguration To get a target Babel configuration.
   * @param {Logger}             appLogger          To print information messages after transpiling
   *                                                files.
   * @param {Targets}            targets            To access targets information.
   */
  constructor(
    babelConfiguration,
    appLogger,
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
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
  }
  /**
   * Transpile a target files for a given build type. This requires the target files to have been
   * previously copied to the distribution directory.
   * @param {Target} target                    The target information.
   * @param {string} [buildType='development'] The build type for which the target is being
   *                                           transpiled for. This will be used to read the source
   *                                           map settings of the target and tell Babel if it needs
   *                                           to create them.
   * @return {Promise<undefined,Error}
   */
  transpileTargetFiles(target, buildType = 'development') {
    const {
      paths: { build: buildPath },
      folders: { build: buildFolder },
      includeTargets,
      sourceMap,
    } = target;
    // Define the variable to return.
    let result;
    // Get the information of all the targets on the `includeTargets` list.
    const includedTargets = includeTargets.map((name) => this.targets.getTarget(name));
    // Try to find one that requires bundling.
    const bundledTarget = includedTargets.find((info) => info.bundle);
    if (bundledTarget) {
      // If there's one that requires bundling, set to return a rejected promise.
      const errorMessage = `The target ${bundledTarget.name} requires bundling so it can't be ` +
        `included by ${target.name}`;
      result = Promise.reject(new Error(errorMessage));
    } else {
      // Find all the JS files on the target path inside the distribution directory.
      result = this.findFiles(buildPath)
      .then((files) => {
        // Get the Babel configuration for the target.
        const babelConfig = this.babelConfiguration.getConfigForTarget(target);
        // Enable source map if the target requires it for the specified build type.
        if (sourceMap[buildType]) {
          babelConfig.sourceMaps = true;
        }
        // Loop all the files and transpile them
        return Promise.all(files.map((file) => this.transpileFile(
          file,
          buildType,
          babelConfig
        )));
      })
      .then((files) => {
        this.appLogger.success('The following files have been successfully transpiled:');
        // Log all the files that have been transpiled.
        files.forEach((file) => {
          const filepath = file.substr(buildPath.length);
          this.appLogger.info(`> ${buildFolder}${filepath}`);
        });

        let nextStep;
        if (includedTargets.length) {
          // ...chain their promises.
          nextStep = Promise.all(includedTargets.map((info) => this.transpileTargetFiles(info)));
        }

        return nextStep;
      })
      .catch((error) => {
        this.appLogger.error(
          `There was an error while transpiling the target '${target.name}' code`
        );
        return Promise.reject(error);
      });
    }

    return result;
  }
  /**
   * Transpile a file.
   * @param {string|Object} filepath                  If used as a string, it's the path to the
   *                                                  file to transpile; if used as an object, it
   *                                                  should have `source` and `output` properties
   *                                                  to define from where to where the file is
   *                                                  transpiled.
   * @param {string}        [buildType='development'] The build type for which the file is being
   *                                                  transpiled for. If `options` is not
   *                                                  specified, the method will try to load the
   *                                                  target configuration based on the file path,
   *                                                  and if the target has source maps enabled for
   *                                                  the build type, it will tell Babel to
   *                                                  create them.
   * @param {?Object}       [options=null]            The Babel configuration to use. If not
   *                                                  defined, the method will try to find a target
   *                                                  configuration using the path of the file.
   * @param {boolean}       [writeFile=true]          If `true`, it will write the transpile code,
   *                                                  otherwise, it will return it on the promise.
   * @return {Promise<Object|string,Error>} If `writeFile` is true, the promise will resolve on
   *                                        an object with the keys `filepath` (the path where it
   *                                        was transpiled) and `code`; but if the parameter is
   *                                        `false`, the promise will resolve on a string with
   *                                        the path to the file.
   * @todo inject `utils` on the next breaking release and remove `this.targets.utils`.
   */
  transpileFile(filepath, buildType = 'development', options = null, writeFile = true) {
    let from = '';
    let originalTo = '';
    let to = '';
    /**
     * Check if the file is a string or an object and define the from where to where the
     * transpilation should happen.
     */
    if (typeof filepath === 'string') {
      from = filepath;
      originalTo = filepath;
    } else {
      from = filepath.source;
      originalTo = filepath.output;
    }
    // Normalize custom JS extensions (jsx, ts or tsx) to `.js`
    to = this.targets.utils.ensureExtension(originalTo);
    // If no options were defined, try to get them from a target, using the path of the file.
    const babelOptions = options || this.getTargetConfigurationForFile(from, buildType);
    // First, transform the file with Babel.
    const firstStep = new Promise((resolve, reject) => {
      babel.transformFile(from, babelOptions, (error, transpiled) => {
        if (error) {
          reject(error);
        } else {
          resolve(transpiled);
        }
      });
    });

    let result;
    // If the file should be written...
    if (writeFile) {
      result = firstStep
      .then((transpiled) => {
        // Define the list of promises that need to be executed.
        const nextSteps = [];
        // Extract the code and the source map from the transpilation results.
        const { code, map } = transpiled;
        let newCode = code;
        // If there's a map...
        if (map) {
          // ...parse and normalize it.
          const sourceMap = this._normalizeSourceMap(to, map);
          // ...update the code to include the link for the map.
          newCode = `${code}\n${sourceMap.link}\n`;
          // ...push the writing of the map onto the promises list.
          nextSteps.push(fs.writeFile(sourceMap.filepath, sourceMap.code));
        }
        // Push the writing of the transpiled code on the promises list.
        nextSteps.unshift(fs.writeFile(to, newCode));
        // Process all the _"writing promises"_.
        return Promise.all(nextSteps);
      })
      // ...if the file wasn't a normal `.js` and the original still exists, delete it.
      .then(() => (to !== originalTo ? fs.pathExists(originalTo) : false))
      .then((exists) => (exists ? fs.remove(originalTo) : null))
      // And return the path to the transpiled file.
      .then(() => to);
    } else {
      result = firstStep
      // Return the code and the path it should've been saved.
      .then((transpiled) => Object.assign({}, transpiled, { filepath: to }));
    }

    return result;
  }
  /**
   * Synchronous version of `transpileFile`.
   * @param {string|Object} filepath                  If used as a string, it's the path to the
   *                                                  file to transpile; if used as an object, it
   *                                                  should have `source` and `output` properties
   *                                                  to define from where to where the file is
   *                                                  transpiled.
   * @param {string}        [buildType='development'] The build type for which the file is being
   *                                                  transpiled for. If `options` is not
   *                                                  specified, the method will try to load the
   *                                                  target configuration based on the file path,
   *                                                  and if the target has source maps enabled for
   *                                                  the build type, it will tell Babel to
   *                                                  create them.
   * @param {?Object}       [options=null]            The Babel configuration to use. If not
   *                                                  defined, the method will try to find a
   *                                                  target configuration using the path of the
   *                                                  file.
   * @param {boolean}       [writeFile=true]          If `true`, it will write the transpile code,
   *                                                  otherwise, it will return it.
   * @return {Object|string} If `writeFile` is true, it will return an object with the keys
   *                         `filepath` (the path where it was transpiled) and `code`; but if the
   *                         parameter is `false`, it will return a string with the path to the
   *                         file.
   * @todo inject `utils` on the next breaking release and remove `this.targets.utils`.
   */
  transpileFileSync(filepath, buildType = 'development', options = null, writeFile = true) {
    let from = '';
    let originalTo = '';
    let to = '';
    /**
     * Check if the file is a string or an object and define the from where to where the
     * transpilation should happen.
     */
    if (typeof filepath === 'string') {
      from = filepath;
      originalTo = filepath;
    } else {
      from = filepath.source;
      originalTo = filepath.output;
    }
    // Normalize custom JS extensions (jsx, ts or tsx) to `.js`
    to = this.targets.utils.ensureExtension(originalTo);
    // If no options were defined, try to get them from a target, using the path of the file.
    const babelOptions = options || this.getTargetConfigurationForFile(from, buildType);
    // First, transform the file with Babel.
    const transpiled = babel.transformFileSync(from, babelOptions);
    let result;

    // If the file should be written...
    if (writeFile) {
      // Extract the code and the source map from the transpilation results
      const { code, map } = transpiled;
      let newCode = code;
      // If there's a map...
      if (map) {
        // ...parse and normalize it.
        const sourceMap = this._normalizeSourceMap(to, map);
        // ...update the code to include the link for the map.
        newCode = `${code}\n${sourceMap.link}\n`;
        // ...write the source map.
        fs.writeFileSync(sourceMap.filepath, sourceMap.code);
      }

      // ...write the file.
      fs.writeFileSync(to, newCode);
      // ...if the file wasn't a normal `.js` and the original still exists, delete it.
      if (to !== originalTo && fs.pathExistsSync(originalTo)) {
        fs.removeSync(originalTo);
      }
      // And set to return the path to the transpiled file.
      result = to;
    } else {
      // Set to return the code and the path it should've been saved.
      result = Object.assign({}, transpiled, { filepath: to });
    }

    return result;
  }
  /**
   * Find files of a given type on a directory.
   * @param {string} directory                         The directory where the files will be
   *                                                   searched for.
   * @param {string} [pattern='**\/*.{js,jsx,ts,tsx}'] A glob pattern to match the files.
   * @return {Promise<Array,Error>} If everything goes well, the promise will resolve on the list
   *                                of files found.
   */
  findFiles(directory, pattern = '**/*.{js,jsx,ts,tsx}') {
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: directory }, (error, files) => {
        if (error) {
          reject(error);
        } else {
          let newFiles = files
          // Filter out TypeScript declaration files.
          .filter((file) => !file.match(/\.d\.tsx?$/i));

          // Generate a list of the TypeScript files.
          const tsFiles = newFiles
          .filter((file) => file.match(/\.tsx?$/i))
          // Remove their extensions for the next validation.
          .map((file) => file.replace(/\.tsx?$/i, ''));

          // If there are TypeScript files...
          if (tsFiles.length) {
            /**
             * Filter the file list by removing those `.js` which have a `.tsx?` file with the
             * same name, as they were generated by transpilation and they don't need to be
             * transpilated again.
             */
            newFiles = newFiles.filter((file) => (
              !file.match(/\.js$/i) ||
              !tsFiles.includes(file.replace(/\.js$/i, ''))
            ));
          }
          // Add the full path to all the files.
          newFiles = newFiles.map((file) => path.join(directory, file));
          resolve(newFiles);
        }
      });
    });
  }
  /**
   * Get a target Babel configuration based on a filepath.
   * @param {string} file                      The file that will be used to obtain the target and
   *                                           then the Babel configuration.
   * @param {string} [buildType='development'] The build type for which the configuration is
   *                                           needed for. This allows the method to check if the
   *                                           target has source map enabled for the build type,
   *                                           and if this happens, it will also enable it on the
   *                                           configuration it returns.
   * @return {Object}
   */
  getTargetConfigurationForFile(file, buildType = 'development') {
    /**
     * Find target using the received filepath. The method will throw an error if a target is not
     * found.
     */
    const target = this.targets.findTargetForFile(file);
    // Return the Babel configuration for the found target.
    const config = this.babelConfiguration.getConfigForTarget(target);
    if (target.sourceMap[buildType]) {
      config.sourceMaps = true;
    }

    return config;
  }
  /**
   * This is a helper method that prepares all the source map information needed to link it on the
   * transpiled file and write it on the file system.
   * @param {string} filepath      The path to the file the map is for.
   * @param {Object} mapProperties The map properties generated by Babel.
   * @return {Object}
   * @property {string} filepath The complete path to the source map.
   * @property {string} filename The name of the source map.
   * @property {string} link     The comment needed on the original source to link the source map.
   * @property {string} code     The actual code of the source map.
   * @access protected
   * @ignore
   */
  _normalizeSourceMap(filepath, mapProperties) {
    const mapPath = `${filepath}.map`;
    const mapName = path.basename(mapPath);
    const link = `//# sourceMappingURL=${mapName}`;
    const code = JSON.stringify(Object.assign({}, mapProperties, { sources: [] }));
    return {
      filepath: mapPath,
      filename: mapName,
      link,
      code,
    };
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildTranspiler` as the `buildTranspiler` service.
 * @example
 * // Register it on the container
 * container.register(buildTranspiler);
 * // Getting access to the service instance
 * const buildTranspiler = container.get('buildTranspiler');
 * @type {Provider}
 */
const buildTranspiler = provider((app) => {
  app.set('buildTranspiler', () => new BuildTranspiler(
    app.get('babelConfiguration'),
    app.get('appLogger'),
    app.get('targets')
  ));
});

module.exports = {
  BuildTranspiler,
  buildTranspiler,
};
