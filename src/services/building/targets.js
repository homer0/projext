const path = require('path');
const extend = require('extend');
const { AppConfiguration } = require('wootils/node/appConfiguration');
const { provider } = require('jimple');
/**
 * This service is in charge of loading and managing the project targets information.
 */
class Targets {
  /**
   * Class constructor.
   * @param {Events}                       events               Used to reduce a target information
   *                                                            after loading it.
   * @param {EnvironmentUtils}             environmentUtils     To send to the configuration
   *                                                            service used by the browser targets.
   * @param {PathUtils}                    pathUtils            Used to build the targets paths.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the targets and their
   *                                                            templates.
   * @param {RootRequire}                  rootRequire          To send to the configuration
   *                                                            service used by the browser targets.
   */
  constructor(
    events,
    environmentUtils,
    pathUtils,
    projectConfiguration,
    rootRequire
  ) {
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
   * This method emits the event reducer `target-load` with the information of a loaded target and
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
        const newTarget = extend(true, {}, template, target, {
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
        // Check if there are missing entries and fill them with the default value.
        newTarget.entry = this._normalizeTargetEntry(newTarget.entry);
        // Check if there are missing entries and merge them with the default value.
        if (newTarget.is.node) {
          newTarget.output = this._normalizeNodeTargetOutput(newTarget.output);
        } else {
          newTarget.output = this._normalizeBrowserTargetOutput(newTarget.output);
        }
        // Replace placeholders on the output settings
        newTarget.output = this._replaceTargetOutputPlaceholders(newTarget);

        // If the target has an `html` setting...
        if (newTarget.html) {
          // Check if there are missing settings that should be replaced with a fallback.
          newTarget.html = this._normalizeTargetHTML(newTarget.html);
        }

        // Check if the target should be transpiled (You can use types without transpilation).
        if (!newTarget.transpile && newTarget.flow) {
          newTarget.transpile = true;
        }
        // Generate the taret paths and folders.
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
   * Find a target by a given filepath.
   * @param {string} file The path of the file that should match with a target path.
   * @return {Target}
   * @throws {Error} If no target is found.
   * @todo The implementation of this method also throws an error if no target is found.
   */
  findTargetForFile(file) {
    const targets = this.getTargets();
    const targetName = Object.keys(targets).find((name) => {
      const target = targets[name];
      return file.includes(target.paths.source);
    });

    if (!targetName) {
      throw new Error(`A target for the following file couldn't be found: ${file}`);
    }

    return targets[targetName];
  }
  /**
   * Get a _'App Configuration'_ for a browser target. This is a utility projext provides for
   * browser targets as they can't load configuration files dynamically, so on the building process,
   * projext uses this service to load the configuration and then injects it on the target bundle.
   * @param {Target} target The target information.
   * @return {Object} The target _'App Configuration'_.
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
    let result = {};
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

      let defaultConfig = {};
      // If the feature options include a default configuration...
      if (defaultConfiguration) {
        // ...use it.
        defaultConfig = defaultConfiguration;
      } else {
        // ...otherwise, load it from a configuration file.
        const defaultConfigPath = `${configsPath}${name}.config.js`;
        defaultConfig = this.rootRequire(defaultConfigPath);
      }
      /**
       * Create a new instance of `AppConfiguration` in order to handle the environment and the
       * merging of the configurations.
       */
      const appConfiguration = new AppConfiguration(
        this.environmentUtils,
        this.rootRequire,
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
      result = appConfiguration.getConfig();
    }

    return result;
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
   * @param {ProjectConfigurationBrowserTargetTemplateOutput} currentOutput
   * The output settings defined on the target after merging it with its type template.
   * @return {ProjectConfigurationBrowserTargetTemplateOutput}
   * @ignore
   * @protected
   */
  _normalizeBrowserTargetOutput(currentOutput) {
    const newOutput = Object.assign({}, currentOutput);
    const { default: defaultOutput } = newOutput;
    delete newOutput.default;
    if (defaultOutput) {
      Object.keys(newOutput).forEach((name) => {
        const value = newOutput[name];
        if (value === null) {
          newOutput[name] = Object.assign({}, defaultOutput);
        } else {
          newOutput[name] = extend(true, {}, defaultOutput, value);
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
   * Checks if there are missing output paths that need to be replaced with the  default fallback,
   * and in case there are, a new set of settings will be generated and returned.
   * @param {ProjectConfigurationNodeTargetTemplateOutput} currentOutput
   * The output settings defined on the target after merging it with its type template.
   * @return {ProjectConfigurationNodeTargetTemplateOutput}
   * @ignore
   * @protected
   */
  _normalizeNodeTargetOutput(currentOutput) {
    return this._normalizeSettingsWithDefault(currentOutput);
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
      if (typeof value === 'string') {
        newOutput[name] = this._replacePlaceholdersOnString(value, placeholders);
      } else if (value) {
        Object.keys(value).forEach((propName) => {
          newOutput[name][propName] = this._replacePlaceholdersOnString(
            newOutput[name][propName],
            placeholders
          );
        });
      }
    });

    return newOutput;
  }
  /**
   * Replace a dictionary of given placeholders on a string.
   * @param {string} string       The target string where the placeholders will be replaced.
   * @param {Object} placeholders A dictionary of placeholders and their values.
   * @return {string}
   * @ignore
   * @protected
   */
  _replacePlaceholdersOnString(string, placeholders) {
    let newString = string;
    Object.keys(placeholders).forEach((name) => {
      newString = newString.replace(
        RegExp(`\\[${name}\\]`, 'ig'),
        placeholders[name]
      );
    });

    return newString;
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
    app.get('events'),
    app.get('environmentUtils'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('rootRequire')
  ));
});

module.exports = {
  Targets,
  targets,
};
