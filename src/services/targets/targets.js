const path = require('path');
const fs = require('fs-extra');
const ObjectUtils = require('wootils/shared/objectUtils');
const { AppConfiguration } = require('wootils/node/appConfiguration');
const { provider } = require('jimple');
/**
 * This service is in charge of loading and managing the project targets information.
 */
class Targets {
  /**
   * @param {DotEnvUtils}                  dotEnvUtils          To read files with environment
   *                                                            variables for the targets and
   *                                                            inject them.
   * @param {Events}                       events               Used to reduce a target information
   *                                                            after loading it.
   * @param {EnvironmentUtils}             environmentUtils     To send to the configuration
   *                                                            service used by the browser targets.
   * @param {Object}                       packageInfo          The project's `package.json`,
   *                                                            necessary to get the project's name
   *                                                            and use it as the name of the
   *                                                            default target.
   * @param {PathUtils}                    pathUtils            Used to build the targets paths.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the targets and their
   *                                                            templates.
   * @param {RootRequire}                  rootRequire          To send to the configuration
   *                                                            service used by the browser targets.
   * @param {Utils}                        utils                To replace plaholders on the targets
   *                                                            paths.
   */
  constructor(
    dotEnvUtils,
    events,
    environmentUtils,
    packageInfo,
    pathUtils,
    projectConfiguration,
    rootRequire,
    utils
  ) {
    /**
     * A local reference for the `dotEnvUtils` service.
     * @type {DotEnvUtils}
     */
    this.dotEnvUtils = dotEnvUtils;
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * A local reference for the `environmentUtils` service.
     * @type {EnvironmentUtils}
     */
    this.environmentUtils = environmentUtils;
    /**
     * The information of the project's `package.json`.
     * @type {Object}
     */
    this.packageInfo = packageInfo;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * All the project settings.
     * @type {ProjectConfigurationSettings}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference for the `rootRequire` function service.
     * @type {RootRequire}
     */
    this.rootRequire = rootRequire;
    /**
     * A local reference for the `utils` service.
     * @type {Utils}
     */
    this.utils = utils;
    /**
     * A dictionary that will be filled with the targets information.
     * @type {Object}
     */
    this.targets = {};
    /**
     * A simple regular expression to validate a target type.
     * @type {RegExp}
     */
    this.typesValidationRegex = /^(?:node|browser)$/i;
    /**
     * The default type a target will be if it doesn't have a `type` property.
     * @type {string}
     */
    this.defaultType = 'node';
    this.loadTargets();
  }
  /**
   * Loads and build the target information.
   * This method emits the reducer event `target-load` with the information of a loaded target and
   * expects an object with a target information on return.
   * @throws {Error} If a target has a type but it doesn't match `this.typesValidationRegex`.
   */
  loadTargets() {
    const {
      targets,
      targetsTemplates,
      paths: { source, build },
    } = this.projectConfiguration;
    // Loop all the targets on the project configuration...
    Object.keys(targets).forEach((name) => {
      const target = targets[name];
      // Validates the type.
      if (target.type && !this.typesValidationRegex.test(target.type)) {
        throw new Error(`Target ${name} has an invalid type: ${target.type}`);
      } else {
        // Define the target folders.
        const sourceFolderName = target.folder || name;
        const buildFolderName = target.createFolder ? sourceFolderName : '';
        // Define the target type.
        const type = target.type || this.defaultType;
        const isNode = type === 'node';
        // Get the type template.
        const template = targetsTemplates[type];
        /**
         * Create the new target information by merging the template, the target information from
         * the configuration and the information defined by this method.
         */
        const newTarget = ObjectUtils.merge(template, target, {
          name,
          type,
          paths: {
            source: '',
            build: '',
          },
          folders: {
            source: '',
            build: '',
          },
          is: {
            node: isNode,
            browser: !isNode,
          },
        });
        // Validate if the target requires bundling and the `engine` setting is invalid.
        if (!newTarget.engine && (newTarget.is.browser || newTarget.bundle)) {
          const error = `The target '${newTarget.name}' requires bundling, but there's ` +
            'no build engine plugin installed';
          throw new Error(error);
        }
        // Check if there are missing entries and fill them with the default value.
        newTarget.entry = this._normalizeTargetEntry(newTarget.entry);
        // Check if there are missing entries and merge them with the default value.
        newTarget.output = this._normalizeTargetOutput(newTarget.output);
        /**
         * Keep the original output settings without the placeholders so internal services or
         * plugins can use them.
         */
        newTarget.originalOutput = ObjectUtils.copy(newTarget.output);
        // Replace placeholders on the output settings
        newTarget.output = this._replaceTargetOutputPlaceholders(newTarget);

        /**
         * To avoid merge issues with arrays (they get merge "by index"), if the target already
         * had a defined list of files for the dotEnv feature, overwrite whatever is on the
         * template.
         */
        if (target.dotEnv && target.dotEnv.files && target.dotEnv.files.length) {
          newTarget.dotEnv.files = target.dotEnv.files;
        }

        // If the target has an `html` setting...
        if (newTarget.html) {
          // Check if there are missing settings that should be replaced with a fallback.
          newTarget.html = this._normalizeTargetHTML(newTarget.html);
        }
        /**
         * If the target doesn't have the `typeScript` option enabled but one of the entry files
         * extension is `.ts`, turn on the option; and if the extension is `.tsx`, set the
         * framework to React.
         */
        if (!newTarget.typeScript) {
          const hasATSFile = Object.keys(newTarget.entry).some((entryEnv) => {
            let found = false;
            const entryFile = newTarget.entry[entryEnv];
            if (entryFile) {
              found = entryFile.match(/\.tsx?$/i);
              if (
                found &&
                entryFile.match(/\.tsx$/i) &&
                typeof newTarget.framework === 'undefined'
              ) {
                newTarget.framework = 'react';
              }
            }

            return found;
          });

          if (hasATSFile) {
            newTarget.typeScript = true;
          }
        }

        // Check if the target should be transpiled (You can't use types without transpilation).
        if (!newTarget.transpile && (newTarget.flow || newTarget.typeScript)) {
          newTarget.transpile = true;
        }

        // Generate the target paths and folders.
        newTarget.folders.source = newTarget.hasFolder ?
          path.join(source, sourceFolderName) :
          source;
        newTarget.paths.source = this.pathUtils.join(newTarget.folders.source);

        newTarget.folders.build = path.join(build, buildFolderName);
        newTarget.paths.build = this.pathUtils.join(newTarget.folders.build);
        // Reduce the target information and save it on the service dictionary.
        this.targets[name] = this.events.reduce('target-load', newTarget);
      }
    });
  }
  /**
   * Get all the registered targets information on a dictionary that uses their names as keys.
   * @return {Object}
   */
  getTargets() {
    return this.targets;
  }
  /**
   * Validate whether a target exists or not.
   * @param {string} name The target name.
   * @return {boolean}
   */
  targetExists(name) {
    return !!this.getTargets()[name];
  }
  /**
   * Get a target information by its name.
   * @param {string} name The target name.
   * @return {Target}
   * @throws {Error} If there's no target with the given name.
   */
  getTarget(name) {
    const target = this.getTargets()[name];
    if (!target) {
      throw new Error(`The required target doesn't exist: ${name}`);
    }

    return target;
  }
  /**
   * Returns the target with the name of project (specified on the `package.json`) and if there's
   * no target with that name, then the first one, using a list of the targets name on alphabetical
   * order.
   * @param {string} [type=''] A specific target type, `node` or `browser`.
   * @return {Target}
   * @throws {Error} If the project has no targets
   * @throws {Error} If the project has no targets of the specified type.
   * @throws {Error} If a specified target type is invalid.
   */
  getDefaultTarget(type = '') {
    const allTargets = this.getTargets();
    let targets = {};
    if (type && !['node', 'browser'].includes(type)) {
      throw new Error(`Invalid target type: ${type}`);
    } else if (type) {
      Object.keys(allTargets).forEach((targetName) => {
        const target = allTargets[targetName];
        if (target.type === type) {
          targets[targetName] = target;
        }
      });
    } else {
      targets = allTargets;
    }

    const names = Object.keys(targets).sort();
    let target;
    if (names.length) {
      const { name: projectName } = this.packageInfo;
      target = targets[projectName] || targets[names[0]];
    } else if (type) {
      throw new Error(`The project doesn't have any targets of the required type: ${type}`);
    } else {
      throw new Error('The project doesn\'t have any targets');
    }

    return target;
  }
  /**
   * Find a target by a given filepath.
   * @param {string} file The path of the file that should match with a target path.
   * @return {Target}
   * @throws {Error} If no target is found.
   */
  findTargetForFile(file) {
    const targets = this.getTargets();
    const targetName = Object.keys(targets)
    .find((name) => file.includes(targets[name].paths.source));

    if (!targetName) {
      throw new Error(`A target couldn't be find for the following file: ${file}`);
    }

    return targets[targetName];
  }
  /**
   * Gets an _'App Configuration'_ for a browser target. This is a utility projext provides for
   * browser targets as they can't load configuration files dynamically, so on the building process,
   * projext uses this service to load the configuration and then injects it on the target bundle.
   * @param {Target} target The target information.
   * @return {Object}
   * @property {Object} configuration The target _'App Configuration'_.
   * @property {Array}  files         The list of files loaded in order to create the
   *                                  configuration.
   * @throws {Error} If the given target is not a browser target.
   */
  getBrowserTargetConfiguration(target) {
    if (target.is.node) {
      throw new Error('Only browser targets can generate configuration on the building process');
    }
    // Get the configuration settings from the target information.
    const {
      name,
      configuration: {
        enabled,
        default: defaultConfiguration,
        path: configurationsPath,
        hasFolder,
        environmentVariable,
        loadFromEnvironment,
        filenameFormat,
      },
    } = target;
    const result = {
      configuration: {},
      files: [],
    };
    // If the configuration feature is enabled...
    if (enabled) {
      // Define the path where the configuration files are located.
      let configsPath = configurationsPath;
      if (hasFolder) {
        configsPath += `${name}/`;
      }
      // Prepare the filename format the `AppConfiguration` class uses.
      const filenameNewFormat = filenameFormat
      .replace(/\[target-name\]/ig, name)
      .replace(/\[configuration-name\]/ig, '[name]');

      /**
       * The idea of `files` and this small wrapper around `rootRequire` is for the method to be
       * able to identify all the external files that were involved on the configuration creation.
       * Then the method can return the list so the build engine can also watch for those files
       * and reload the target not only when the source changes, but when the config changes too.
       */
      const files = [];
      const rootRequireAndSave = (filepath) => {
        files.push(filepath);
        return this.rootRequire(filepath);
      };

      let defaultConfig = {};
      // If the feature options include a default configuration...
      if (defaultConfiguration) {
        // ...use it.
        defaultConfig = defaultConfiguration;
      } else {
        // ...otherwise, load it from a configuration file.
        const defaultConfigPath = `${configsPath}${name}.config.js`;
        defaultConfig = rootRequireAndSave(defaultConfigPath);
      }

      /**
       * Create a new instance of `AppConfiguration` in order to handle the environment and the
       * merging of the configurations.
       */
      const appConfiguration = new AppConfiguration(
        this.environmentUtils,
        rootRequireAndSave,
        name,
        defaultConfig,
        {
          environmentVariable,
          path: configsPath,
          filenameFormat: filenameNewFormat,
        }
      );
      // If the feature supports loading a configuration using an environment variable...
      if (loadFromEnvironment) {
        // ...Tell the instance of `AppConfiguration` to look for it.
        appConfiguration.loadFromEnvironment();
      }
      // Finally, set to return the configuration generated by the service.
      result.configuration = appConfiguration.getConfig();
      result.files = files;
    }

    return result;
  }
  /**
   * Loads the environment file(s) for a target and, if specified, inject their variables.
   * This method uses the `target-environment-variables` reducer event, which receives the
   * dictionary with the variables for the target, the target information and the build type; it
   * expects an updated dictionary of variables in return.
   * @param {Target}  target                    The target information.
   * @param {string}  [buildType='development'] The type of bundle projext is generating or the
   *                                            environment a Node target is being executed for.
   * @param {boolean} [inject=true]             Whether or not to inject the variables after
   *                                            loading them.
   * @return {Object} A dictionary with the target variables that were injected in the environment.
   */
  loadTargetDotEnvFile(target, buildType = 'development', inject = true) {
    let result;
    if (target.dotEnv.enabled && target.dotEnv.files.length) {
      const files = target.dotEnv.files.map((file) => (
        file
        .replace(/\[target-name\]/ig, target.name)
        .replace(/\[build-type\]/ig, buildType)
      ));
      const parsed = this.dotEnvUtils.load(files, target.dotEnv.extend);
      if (parsed.loaded) {
        result = this.events.reduce(
          'target-environment-variables',
          parsed.variables,
          target,
          buildType
        );

        if (inject) {
          this.dotEnvUtils.inject(result, target.dotEnv.overwrite);
        }
      }
    }

    return result || {};
  }
  /**
   * Gets a list with the information for the files the target needs to copy during the
   * bundling process.
   * This method uses the `target-copy-files` reducer event, which receives the list of files to
   * copy, the target information and the build type; it expects an updated list on return.
   * The reducer event can be used to inject a {@link TargetExtraFileTransform} function.
   * @param {Target} target                    The target information.
   * @param {string} [buildType='development'] The type of bundle projext is generating.
   * @return {Array} A list of {@link TargetExtraFile}s.
   * @throws {Error} If the target type is `node` but bundling is disabled. There's no need to copy
   *                 files on a target that doesn't require bundling.
   * @throws {Error} If one of the files to copy doesn't exist.
   */
  getFilesToCopy(target, buildType = 'development') {
    // Validate the target settings
    if (target.is.node && !target.bundle) {
      throw new Error('Only targets that require bundling can copy files');
    }
    // Get the target paths.
    const {
      paths: {
        build,
        source,
      },
    } = target;
    // Format the list.
    let newList = target.copy.map((item) => {
      // Define an item structure.
      const newItem = {
        from: '',
        to: '',
      };
      /**
       * If the item is a string, use its name and copy it to the target distribution directory
       * root; but if the target is an object, just prefix its paths with the target directories.
       */
      if (typeof item === 'string') {
        const filename = path.basename(item);
        newItem.from = path.join(source, item);
        newItem.to = path.join(build, filename);
      } else {
        newItem.from = path.join(source, item.from);
        newItem.to = path.join(build, item.to);
      }

      return newItem;
    });

    // Reduce the list.
    newList = this.events.reduce('target-copy-files', newList, target, buildType);

    const invalid = newList.find((item) => !fs.pathExistsSync(item.from));
    if (invalid) {
      throw new Error(`The file to copy doesn't exist: ${invalid.from}`);
    }

    return newList;
  }
  /**
   * Checks if there are missing entries that need to be replaced with the default fallback, and in
   * case there are, a new set of entries will be generated and returned.
   * @param {ProjectConfigurationTargetTemplateEntry} currentEntry
   * The entries defined on the target after merging it with its type template.
   * @return {ProjectConfigurationTargetTemplateEntry}
   * @ignore
   * @protected
   */
  _normalizeTargetEntry(currentEntry) {
    return this._normalizeSettingsWithDefault(currentEntry);
  }
  /**
   * Checks if there are missing output settings that need to be merged with the ones on the
   * default fallback, and in case there are, a new set of output settings will be generated and
   * returned.
   * @param {ProjectConfigurationTargetTemplateOutput} currentOutput
   * The output settings defined on the target after merging it with its type template.
   * @return {ProjectConfigurationTargetTemplateOutput}
   * @ignore
   * @protected
   */
  _normalizeTargetOutput(currentOutput) {
    const newOutput = Object.assign({}, currentOutput);
    const { default: defaultOutput } = newOutput;
    delete newOutput.default;
    if (defaultOutput) {
      Object.keys(newOutput).forEach((name) => {
        const value = newOutput[name];
        if (value === null) {
          newOutput[name] = Object.assign({}, defaultOutput);
        } else {
          newOutput[name] = ObjectUtils.merge(defaultOutput, value);
          Object.keys(newOutput[name]).forEach((propName) => {
            if (!newOutput[name][propName] && defaultOutput[propName]) {
              newOutput[name][propName] = defaultOutput[propName];
            }
          });
        }
      });
    }

    return newOutput;
  }
  /**
   * Replace the common placeholders from a target output paths.
   * @param {Target} target The target information.
   * @return {
   *  ProjectConfigurationNodeTargetTemplateOutput|ProjectConfigurationBoTargetTemplateOutput
   * }
   * @ignore
   * @protected
   */
  _replaceTargetOutputPlaceholders(target) {
    const placeholders = {
      'target-name': target.name,
      hash: Date.now(),
    };

    const newOutput = Object.assign({}, target.output);
    Object.keys(newOutput).forEach((name) => {
      const value = newOutput[name];
      Object.keys(value).forEach((propName) => {
        const propValue = newOutput[name][propName];
        newOutput[name][propName] = typeof propValue === 'string' ?
          this.utils.replacePlaceholders(
            propValue,
            placeholders
          ) :
          propValue;
      });
    });

    return newOutput;
  }
  /**
   * Checks if there are missing HTML settings that need to be replaced with the default fallback,
   * and in case there are, a new set of settings will be generated and returned.
   * @param {ProjectConfigurationBrowserTargetTemplateHTMLSettings} currentHTML
   * The HTML settings defined on the target after merging it with its type template.
   * @return {ProjectConfigurationBrowserTargetTemplateHTMLSettings}
   * @ignore
   * @protected
   */
  _normalizeTargetHTML(currentHTML) {
    return this._normalizeSettingsWithDefault(currentHTML);
  }
  /**
   * Given a dictionary of settings that contains a `default` key, this method will check each of
   * the other keys and if its find any `null` value, it will replace that key value with the one
   * on the `default` key.
   * @param {Object} currentSettings The dictionary to "complete".
   * @property {*} default The default value that will be assigned to any other key with `null`
   *                       value.
   * @return {Object}
   * @ignore
   * @protected
   */
  _normalizeSettingsWithDefault(currentSettings) {
    const newSettings = Object.assign({}, currentSettings);
    const { default: defaultValue } = newSettings;
    delete newSettings.default;
    if (defaultValue !== null) {
      Object.keys(newSettings).forEach((name) => {
        if (newSettings[name] === null) {
          newSettings[name] = defaultValue;
        }
      });
    }

    return newSettings;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `Targets` as the `targets` service.
 * @example
 * // Register it on the container
 * container.register(targets);
 * // Getting access to the service instance
 * const targets = container.get('targets');
 * @type {Provider}
 */
const targets = provider((app) => {
  app.set('targets', () => new Targets(
    app.get('dotEnvUtils'),
    app.get('events'),
    app.get('environmentUtils'),
    app.get('packageInfo'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('rootRequire'),
    app.get('utils')
  ));
});

module.exports = {
  Targets,
  targets,
};
