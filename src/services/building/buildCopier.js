const fs = require('fs-extra');
const path = require('path');
const { provider } = require('jimple');
/**
 * Copies the project files and/or the files of a target that doesn't require bundling.
 */
class BuildCopier {
  /**
   * Class constructor.
   * @param {Copier.copy}                  copier               The function that copies files and
   *                                                            directories.
   * @param {Logger}                       appLogger            Used to inform the user when files
   *                                                            are being copied.
   * @param {Events}                       events               To trigger events reducer that may
   *                                                            alter the items being copied.
   * @param {PathUtils}                    pathUtils            Necessary to build the paths.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the project information and
   *                                                            get paths.
   * @param {Targets}                      targets              To get the information of targets
   *                                                            from `includeTargets` and copy their
   *                                                            files too.
   */
  constructor(copier, appLogger, events, pathUtils, projectConfiguration, targets) {
    /**
     * A local reference for the `copier` service function.
     * @type {Copier.copy}
     */
    this.copier = copier;
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
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
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
  }
  /**
   * If `copy.enabled` is `true` on the project configuration, this method will copy the list of
   * items on the configuration `copy.items` key.
   * This method emits the event reducer `project-files-to-copy` with the list of items to copy and
   * expects an `Array` on return.
   * @return {Promise<undefined,Error>}
   */
  copyFiles() {
    let result;
    const {
      copy,
      version: {
        revision,
      },
      paths: {
        build,
        privateModules,
      },
    } = this.projectConfiguration;
    // If the feature is enabled...
    if (copy.enabled) {
      // ..prepare a list of the items
      let items = [];
      // Prepare a list of Node modules that may be copied.
      const copiedModules = {};
      // If there are items to copy on the project configuration...
      if (Array.isArray(copy.items)) {
        // ...loop the items.
        copy.items.forEach((item) => {
          // If the item is a Node module...
          if (typeof item === 'string' && item.startsWith('node_modules')) {
            // ...generate a new path for the module inside a private folder.
            const newModulePath = item.replace(/^(node_modules\/)/, `${privateModules}/`);
            // Save the name of the module linked to the new path.
            copiedModules[item.split('/').pop()] = newModulePath;
            // Push the module and its new path to the list of items to copy.
            items.push({
              [item]: newModulePath,
            });
          } else {
            // ...otherwise, just push it to the list of items to copy.
            items.push(item);
          }
        });

        // if the revision functionality is enabled and the file exists...
        if (
          revision.enabled &&
          revision.copy &&
          fs.pathExistsSync(this.pathUtils.join(revision.filename))
        ) {
          // ...add it to the items to copy.
          items.push(revision.filename);
        }
        // Reduce the list of items to copy and give the chance to any plugin to add new ones.
        items = this.events.reduce('project-files-to-copy', items);
        // If there are still items to copy...
        if (items.length) {
          // ...grab a reference to the path of the project.
          const thispath = this.pathUtils.path;
          // Copy all the items on the project path onto the distribution directory.
          result = this.copier(
            thispath,
            this.pathUtils.join(build),
            items
          )
          .then((results) => {
            this.appLogger.success('The following items have been successfully copied:');
            // Remove the absolute path and the first `/`
            const prefix = thispath.length + 1;
            // Log a message for each item informing it was copied.
            results.forEach((item) => {
              const from = item.from.substr(prefix);
              const to = item.to.substr(prefix);
              this.appLogger.info(`${from} -> ${to}`);
            });
            /**
             * If there any Node module was copied, call the method that updates the copied
             * `package.json` of the project and modules in order to use relative paths instead of
             * versions of the npm/yarn registry.
             */
            return Object.keys(copiedModules).length ?
              this.addPrivateModules(this.pathUtils.join(build, 'package.json'), copiedModules) :
              {};
          })
          .catch((error) => {
            this.appLogger.error('There was an error while copying the files');
            return Promise.reject(error);
          });
        } else {
          result = Promise.resolve();
        }
      } else {
        result = Promise.reject(new Error('The \'copy.items\' setting is not an array'));
      }
    } else {
      result = Promise.resolve();
    }

    return result;
  }
  /**
   * After the project files are copied, this module updates the copied package.json with local
   * references for any given module name.
   * @param {string}  packagePath             The path to the main `package.json`.
   * @param {Object}  modules                 A dictionary with the name of modules as keys and
   *                                          local paths as values.
   * @param {boolean} [updateModulesToo=true] If `true`, it will also update the `package.json` of
   *                                          each of the modules with references each others local
   *                                          paths.
   * @return Promise<undefined,Error>
   */
  addPrivateModules(packagePath, modules, updateModulesToo = true) {
    // Read the main `package.json`
    return fs.readJson(packagePath)
    .then((packageContents) => {
      // Create a new reference to avoid linting issues.
      const newPackage = Object.assign({}, packageContents);
      // Loop the different types of dependencies...
      ['dependencies', 'devDependencies']
      .forEach((type) => {
        // Loop the dictionary of modules...
        Object.keys(modules).forEach((dependencyName) => {
          // If the module is present...
          if (newPackage[type] && newPackage[type][dependencyName]) {
            // ...change the version to the local path.
            newPackage[type][dependencyName] = `./${modules[dependencyName]}`;
          }
        });
      });
      // Remove any "private property" npm adds on the `package.json`
      Object.keys(newPackage).forEach((property) => {
        if (property.startsWith('_')) {
          delete newPackage[property];
        }
      });
      // Write the updated file.
      return fs.writeJson(packagePath, newPackage);
    })
    .then(() => {
      let result = {};
      // If it needs to also update the methods between each other...
      if (updateModulesToo) {
        // Get the location of the private folder where modules are copied.
        const { paths: { privateModules } } = this.projectConfiguration;
        // Generate a path to it.
        const directory = path.join(path.dirname(packagePath), privateModules);
        const packages = [];
        const modulesWithPathToRoot = {};
        // Loop all the modules...
        Object.keys(modules).forEach((dependencyName) => {
          // Get its private path.
          const privatePath = modules[dependencyName];
          /**
           * Updates it by adding 2 levels up from its location so they will be relative to where
           * the `package.json` is: one to `node_modules`, and a second one to the "root"
           */
          modulesWithPathToRoot[dependencyName] = `../../${privatePath}`;
          /**
           * Push the module `package.json` path to the list of `package.json`s that will be
           * updated.
           */
          packages.push(path.join(directory, dependencyName, 'package.json'));
        });
        /**
         * Loop all the `package.json`s and call this same method to update their references, but
         * with the flag to update modules disabled as it's already doing it.
         */
        result = Promise.all(packages.map((modulePackage) => this.addPrivateModules(
          modulePackage,
          modulesWithPathToRoot,
          false
        )));
      }

      return result;
    });
  }
  /**
   * Copy the files of an specific target.
   * @param {Target} target The target information.
   * @return {Promise<undefined,Error>}
   */
  copyTargetFiles(target) {
    // Define the variable to return.
    let result;
    // Get the information of all the targets on the `includeTargets` list.
    const includedTargets = target.includeTargets.map((name) => this.targets.getTarget(name));
    // Try to find one that requires bundling.
    const bundledTarget = includedTargets.find((info) => info.bundle);
    if (bundledTarget) {
      // If there's one that requires bundling, set to return a rejected promise.
      const errorMessage = `The target ${bundledTarget.name} requires bundling so it can't be ` +
        `included by ${target.name}`;
      result = Promise.reject(new Error(errorMessage));
    } else {
      /**
       * If there are no included targets or none that requires bundling, continue...
       * Make sure the build directory exists.
       */
      result = fs.ensureDir(target.paths.build)
      // Get all the items on the source directory.
      .then(() => fs.readdir(target.paths.source))
      // Copy everything.
      .then((items) => this.copier(
        target.paths.source,
        target.paths.build,
        items
      ))
      .then(() => {
        this.appLogger.success(
          `The files for '${target.name}' have been successfully copied (${target.paths.build})`
        );
        let nextStep;
        // If there are targets to include...
        if (includedTargets.length) {
          // ...chain their promises.
          nextStep = Promise.all(includedTargets.map((info) => this.copyTargetFiles(info)));
        }

        return nextStep;
      })
      .catch((error) => {
        this.appLogger.error(`The files for '${target.name}' couldn't be copied`);
        return Promise.reject(error);
      });
    }

    return result;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildCopier` as the `buildCopier` service.
 * @example
 * // Register it on the container
 * container.register(buildCopier);
 * // Getting access to the service instance
 * const buildCopier = container.get('buildCopier');
 * @type {Provider}
 */
const buildCopier = provider((app) => {
  app.set('buildCopier', () => new BuildCopier(
    app.get('copier'),
    app.get('appLogger'),
    app.get('events'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('targets')
  ));
});

module.exports = {
  BuildCopier,
  buildCopier,
};
