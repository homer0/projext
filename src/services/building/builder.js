const { provider } = require('jimple');
/**
 * This is the main _"bridge service"_ for building: It connects the rest of the building services
 * and perform most of the _"building-related tasks"_.
 */
class Builder {
  /**
   * Class constructor.
   * @param {BuildCleaner}    buildCleaner    Used to clean a target builded files before building
   *                                          again.
   * @param {BuildCopier}     buildCopier     Used to copy a target files if it doesn't require
   *                                          bundling.
   * @param {BuildEngines}    buildEngines    To access the engines in charge of building targets.
   * @param {buildTranspiler} buildTranspiler To transpile files of atarget that doesn't require
   *                                          bundling.
   * @param {Targets}         targets         To access targets information.
   */
  constructor(
    buildCleaner,
    buildCopier,
    buildEngines,
    buildTranspiler,
    targets
  ) {
    /**
     * A local reference for the `buildCleaner` service.
     * @type {BuildCleaner}
     */
    this.buildCleaner = buildCleaner;
    /**
     * A local reference for the `buildCopier` service.
     * @type {BuildCopier}
     */
    this.buildCopier = buildCopier;
    /**
     * A local reference for the `buildEngines` service.
     * @type {BuildEngines}
     */
    this.buildEngines = buildEngines;
    /**
     * A local reference for the `buildTranspiler` service.
     * @type {BuildTranspiler}
     */
    this.buildTranspiler = buildTranspiler;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
  }
  /**
   * Get a build command for a target. If the target doesn't require bundling, it will return an
   * empty string, otherwise, it will ask the build engine the target uses for the required shell
   * command.
   * @param {Target}  target           The target information.
   * @param {String}  buildType        The type of build intended: `production` or `development`.
   * @param {Boolean} [forceRun=false] Whether or not the build command should also run the target.
   * @return {String}
   */
  getTargetBuildCommand(target, buildType, forceRun = false) {
    let command = '';
    if (target.bundle !== false) {
      const engine = this.buildEngines.getEngine(target.engine);
      command = engine.getBuildCommand(target, buildType, forceRun);
    }

    return command;
  }
  /**
   * Copy a target files to the distribution directory. The only reason to copy a target files are:
   * If the target needs to be transpiles or if the build type is `production`, on all the other
   * cases the method won't do anything.
   * @param {String} targetName The name of the target.
   * @param {String} buildType  The type of build it's being made: `production` or `development`.
   * @return {Promise<undefined,Error>}
   */
  copyTarget(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    let result;
    if (
      target.is.node &&
      target.bundle === false &&
      (buildType === 'production' || target.transpile)
    ) {
      result = this.buildCopier.copyTargetFiles(target);
    } else {
      result = Promise.resolve();
    }

    return result;
  }
  /**
   * Transpile a target files **that have been previously copied** to the distribution directory.
   * If the target is not a Node target or it doesn't require transpiling, this method won't do
   * anything.
   * @param {String} targetName The name of the target.
   * @param {String} buildType  The type of build it's being made: `production` or `development`.
   * @return {Promise<undefined,Error>}
   */
  transpileTarget(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    let result;
    if (
      target.is.node &&
      target.bundle === false &&
      target.transpile
    ) {
      result = this.buildTranspiler.transpileTargetFiles(target, buildType);
    } else {
      result = Promise.resolve();
    }

    return result;
  }
  /**
   * Removes all previous builds/copies of a target from the distribution directory.
   * @param {String} targetName The name of the target.
   * @return {Promise<undefined,Error>}
   */
  cleanTarget(targetName) {
    const target = this.targets.getTarget(targetName);
    return this.buildCleaner.cleanTarget(target);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `Builder` as the `builder` service.
 * @example
 * // Register it on the container
 * container.register(builder);
 * // Getting access to the service instance
 * const builder = container.get('builder');
 * @type {Provider}
 */
const builder = provider((app) => {
  app.set('builder', () => new Builder(
    app.get('buildCleaner'),
    app.get('buildCopier'),
    app.get('buildEngines'),
    app.get('buildTranspiler'),
    app.get('targets')
  ));
});

module.exports = {
  Builder,
  builder,
};
