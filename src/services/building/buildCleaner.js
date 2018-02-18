const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * Remove the builded files for the project and/or an specific target.
 */
class BuildCleaner {
  /**
   * Class constructor.
   * @param {Logger}                       appLogger            Used to inform the user when files
   *                                                            haven been removed of it there was
   *                                                            a problem removing them.
   * @param {Cleaner.clean}                cleaner              The function that removes
   *                                                            directories and files using glob
   *                                                            patterns.
   * @param {PathUtils}                    pathUtils            Necessary to build the paths to
   *                                                            clean.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the project information and
   *                                                            get paths.
   */
  constructor(
    appLogger,
    cleaner,
    pathUtils,
    projectConfiguration
  ) {
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `cleaner` service function.
     * @type {Cleaner.clean}
     */
    this.cleaner = cleaner;
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
  }
  /**
   * Removes the entire distribution directory (where are the targets build are located).
   * @return {Promise<undefined,Error>}
   */
  cleanAll() {
    const { paths: { build } } = this.projectConfiguration;
    const dist = this.pathUtils.join(build);
    return this.cleaner(dist, '**')
    .then(() => {
      this.appLogger.success(
        `The distribution directory was successfully removed (${dist})`
      );
    })
    .catch((error) => {
      this.appLogger.error(
        `Error: There was an error while removing the distribution directory (${dist})`
      );

      return Promise.reject(error);
    });
  }
  /**
   * Removes the builded files of an specific target.
   * @param {Target} target The target information.
   * @return {Promise<undefined,Error>}
   */
  cleanTarget(target) {
    const { paths: { build } } = this.projectConfiguration;
    const dist = this.pathUtils.join(build);
    let firstStep;
    if (target.is.node && !target.bundle) {
      firstStep = fs.readdir(target.paths.source);
    } else {
      const items = [];
      const placeholders = {
        'target-name': target.name,
        hash: '*',
        name: '*',
        ext: '*',
      };
      Object.keys(target.originalOutput).forEach((type) => {
        const output = target.originalOutput[type];
        // JS
        const js = this._replacePlaceholdersOnString(output.js, placeholders);
        items.push(js);
        if (target.is.browser) {
          items.push(`${js}.map`);
        }
        // Others
        items.push(...[
          this._replacePlaceholdersOnString(output.css, placeholders),
          this._replacePlaceholdersOnString(output.fonts, placeholders),
          this._replacePlaceholdersOnString(output.images, placeholders),
        ]);
      });

      if (target.is.browser && target.html) {
        items.push(target.html.filename);
      }

      items.push(...items.map((item) => `${item}.gz`));
      firstStep = Promise.resolve(items);
    }

    return firstStep
    .then((items) => this.cleaner(target.paths.build, items))
    .then(() => {
      this.appLogger.success(
        `The files for ${target.name} have been was successfully removed from ` +
        `the distribution directory (${dist})`
      );
    })
    .catch((error) => {
      this.appLogger.error(
        `Error: There was an error while removing the files for ${target.name} ` +
        `from the distribution directory (${dist})`
      );

      return Promise.reject(error);
    });
  }
  /**
   * Get all the names variations for a target bundled file based on the target name.
   * @param {string} name The target name.
   * @return {Array} A list of all the possible names of files related to that target.
   * @deprecated
   */
  getTargetNamesVariation(name) {
    const names = [
      name,
      `${name}.js`,
      `${name}.js.map`,
      `${name}.*.js`,
      `${name}.*.js.map`,
    ];
    names.push(...names.map((file) => `${file}.gz`));
    return names;
  }
  /**
   * Replace a dictionary of given placeholders on a string.
   * @param {string} string       The target string where the placeholders will be replaced.
   * @param {Object} placeholders A dictionary of placeholders and their values.
   * @return {string}
   * @ignore
   * @protected
   * @todo Move to a shared placed so it can be used by Targets and this class without duplication.
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
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildCleaner` as the `buildCleaner` service.
 * @example
 * // Register it on the container
 * container.register(buildCleaner);
 * // Getting access to the service instance
 * const buildCleaner = container.get('buildCleaner');
 * @type {Provider}
 */
const buildCleaner = provider((app) => {
  app.set('buildCleaner', () => new BuildCleaner(
    app.get('appLogger'),
    app.get('cleaner'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig()
  ));
});

module.exports = {
  BuildCleaner,
  buildCleaner,
};
