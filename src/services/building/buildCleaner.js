const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * Remove the builded files for the project and/or an specific target.
 */
class BuildCleaner {
  /**
   * Class constructor.
   * @param {Logger}               appLogger            Used to inform the user when files haven
   *                                                    been removed of it there was a problem
   *                                                    removing them.
   * @param {cleaner}              cleaner              The function that removes directories and
   *                                                    files using glob patterns.
   * @param {PathUtils}            pathUtils            Necessary to build the paths to clean.
   * @param {ProjectConfiguration} projectConfiguration To read the project information and get
   *                                                    paths.
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
     * @type {Logger}
     */
    this.cleaner = cleaner;
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
    const cleanStep = target.is.node ?
      this.cleanNodeTarget(target) :
      this.cleanBrowserTarget(target);

    return cleanStep
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
   * Removes the builded files of a Node target.
   * @param {Target} target The target information.
   * @return {Promise<undefined,undefined>}
   */
  cleanNodeTarget(target) {
    const {
      bundle,
      name,
      paths: {
        source,
        build,
      },
    } = target;
    const firstStep = bundle ?
      Promise.resolve(this.getTargetNamesVariation(name)) :
      fs.readdir(source);

    return firstStep
    .then((items) => this.cleaner(build, items));
  }
  /**
   * Removes the builded files of a browser target.
   * @param {Target} target The target information.
   * @return {Promise<undefined,undefined>}
   */
  cleanBrowserTarget(target) {
    const { paths: { output } } = this.projectConfiguration;
    const {
      name,
      html,
      paths: { build },
    } = target;
    const items = [
      ...this.getTargetNamesVariation(name),
      ...Object.keys(output).map((folder) => output[folder]),
    ];

    if (!target.library) {
      items.push(...[
        html.filename,
        `${html.filename}.gz`,
      ]);
    }

    return this.cleaner(build, items);
  }
  /**
   * Get all the names variations for a target bundled file based on the target name.
   * @param {String} name The target name.
   * @return {Array} A list of all the possible names of files related to that target.
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
