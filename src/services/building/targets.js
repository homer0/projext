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
   * @param {Events}               events               Used to reduce a target information after
   *                                                    loading it.
   * @param {EnvironmentUtils}     environmentUtils     To send to the configuration service used
   *                                                    by the browser targets.
   * @param {PathUtils}            pathUtils            Used to build the targets paths.
   * @param {ProjectConfiguration} projectConfiguration To read the targets and their templates.
   * @param {Function}             rootRequire          To send to the configuration service used
   *                                                    by the browser targets.
   */
  constructor(
    events,
    environmentUtils,
    pathUtils,
    projectConfiguration,
    rootRequire
  ) {
    /**
     * A local reference to the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * A local reference to the `environmentUtils` service.
     * @type {EnvironmentUtils}
     */
    this.environmentUtils = environmentUtils;
    /**
     * A local reference to the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A local reference to the `projectConfiguration` service.
     * @type {ProjectConfiguration}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference to the `rootRequire` function service.
     * @type {Function}
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
     * @type {String}
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
   * @param {String} name The target name.
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
   * @param {String} file The path of the file that should match with a target path.
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
   * Get a _'App Configuration'_ for a browser target. This is a utility Woopack provides for
   * browser targets as they can't load configuration files dynamically, so on the building process,
   * Woopack uses this service to load the configuration and then injects it on the target bundle.
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
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `Targets` as the `targets` service.
 * @example
 * // Register is on the container
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
