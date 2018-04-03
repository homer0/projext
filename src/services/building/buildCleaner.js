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
   * @param {Utils}                        utils                To replace plaholders on the targets
   *                                                            paths.
   */
  constructor(
    appLogger,
    cleaner,
    pathUtils,
    projectConfiguration,
    utils
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
    /**
     * A local reference for the `utils` service.
     * @type {Utils}
     */
    this.utils = utils;
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
        const js = this.utils.replacePlaceholders(output.js, placeholders);
        items.push(js);
        if (target.is.browser) {
          items.push(`${js}.map`);
        }
        // Others
        items.push(...[
          this.utils.replacePlaceholders(output.css, placeholders),
          this.utils.replacePlaceholders(output.fonts, placeholders),
          this.utils.replacePlaceholders(output.images, placeholders),
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
        `The files for '${target.name}' have been was successfully removed from ` +
        `the distribution directory (${dist})`
      );
    })
    .catch((error) => {
      this.appLogger.error(
        `Error: There was an error while removing the files for '${target.name}' ` +
        `from the distribution directory (${dist})`
      );

      return Promise.reject(error);
    });
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
    app.get('projectConfiguration').getConfig(),
    app.get('utils')
  ));
});

module.exports = {
  BuildCleaner,
  buildCleaner,
};
