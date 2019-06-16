const path = require('path');
const { provider } = require('jimple');
/**
 * This service provides a simple interface for running targets on a development environment using
 * `Nodemon`. The actual service that does the _'running'_ is `buildNodeRunnerProcess`, but this
 * one takes care of reading and processing a target settings before telling the other service
 * to start Nodemon.
 */
class BuildNodeRunner {
  /**
   * Class constructor.
   * @param {BuildNodeRunnerProcess}       buildNodeRunnerProcess To actually run a target process.
   * @param {ProjectConfigurationSettings} projectConfiguration   To read the targets and their
   *                                                              templates.
   * @param {Targets}                      targets                To get the information of the
   *                                                              included targets.
   */
  constructor(buildNodeRunnerProcess, projectConfiguration, targets) {
    /**
     * A local reference for the `buildNodeRunnerProcess` service.
     * @type {BuildNodeRunnerProcess}
     */
    this.buildNodeRunnerProcess = buildNodeRunnerProcess;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    // Check the project settings and enable the `nodemon` legacy watch mode.
    if (projectConfiguration.others.nodemon.legacyWatch) {
      this.buildNodeRunnerProcess.enableLegacyWatch();
    }
  }
  /**
   * Run a target with Nodemon.
   * @param {Target}  target               The target information.
   * @param {boolean} [forceInspect=false] Whether or not to _"force enable"_ the Node inspector,
   *                                       even if the target has disabled it.
   * @return {Nodemon}
   * @throws {Error} If the target type is `browser`.
   * @throws {Error} If the target needs to be bundled.
   */
  runTarget(target, forceInspect = false) {
    if (target.is.browser) {
      throw new Error(`${target.name} is a browser target and can't be executed`);
    } else if (target.bundle) {
      throw new Error(`${target.name} needs to be bundled in order to run`);
    }

    const inspectOptions = Object.assign({}, target.inspect, {
      enabled: (forceInspect || target.inspect.enabled),
    });

    return target.transpile ?
      this._runWithTranspilation(target, inspectOptions) :
      this._run(target, inspectOptions);
  }
  /**
   * Runs a target that requires transpilation. It executes the file from the distribution
   * directory while it watches the source directory.
   * @param {Target}                target         The target information.
   * @param {NodeInspectorSettings} inspectOptions The options for the Node inspector.
   * @return {Nodemon}
   * @throws {Error} If one of the included targets requires bundling.
   * @access protected
   * @ignore
   * @todo inject `utils` on the next breaking release and remove `this.targets.utils`.
   */
  _runWithTranspilation(target, inspectOptions) {
    const { paths: { source, build }, includeTargets } = target;
    const executable = path.join(build, target.entry.development);
    const watch = [build];
    const copyPaths = [];
    const transpilationPaths = [{
      from: source,
      to: build,
    }];

    includeTargets.forEach((name) => {
      const subTarget = this.targets.getTarget(name);
      if (subTarget.bundle) {
        const errorMessage = `The target ${name} requires bundling so it can't be ` +
          `included by ${target.name}`;
        throw new Error(errorMessage);
      } else {
        watch.push(subTarget.paths.build);
        const pathSettings = {
          from: subTarget.paths.source,
          to: subTarget.paths.build,
        };
        if (subTarget.transpile) {
          transpilationPaths.push(pathSettings);
        } else {
          copyPaths.push(pathSettings);
        }
      }
    });

    this.buildNodeRunnerProcess.run(
      this.targets.utils.ensureExtension(executable),
      watch,
      inspectOptions,
      transpilationPaths,
      copyPaths
    );
  }
  /**
   * Runs a target that doesn't require transpilation. It executes and watches the source directory.
   * @param {Target}                target         The target information.
   * @param {NodeInspectorSettings} inspectOptions The options for the Node inspector.
   * @return {Nodemon}
   * @throws {Error} If one of the included targets requires bundling.
   * @throws {Error} If one of the included targets requires transpiling.
   * @access protected
   * @ignore
   */
  _run(target, inspectOptions) {
    const { paths: { source }, includeTargets } = target;
    const executable = path.join(source, target.entry.development);
    const watch = [source];

    includeTargets.forEach((name) => {
      const subTarget = this.targets.getTarget(name);
      if (subTarget.bundle) {
        const errorMessage = `The target ${name} requires bundling so it can't be ` +
          `included by ${target.name}`;
        throw new Error(errorMessage);
      } else if (subTarget.transpile) {
        const errorMessage = `The target ${name} requires transpilation so it can't be ` +
          `included by ${target.name}`;
        throw new Error(errorMessage);
      } else {
        watch.push(subTarget.paths.source);
      }
    });

    this.buildNodeRunnerProcess.run(
      executable,
      watch,
      inspectOptions
    );
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildNodeRunner` as the `buildNodeRunner` service.
 * @example
 * // Register it on the container
 * container.register(buildNodeRunner);
 * // Getting access to the service instance
 * const buildNodeRunner = container.get('buildNodeRunner');
 * @type {Provider}
 */
const buildNodeRunner = provider((app) => {
  app.set('buildNodeRunner', () => new BuildNodeRunner(
    app.get('buildNodeRunnerProcess'),
    app.get('projectConfiguration').getConfig(),
    app.get('targets')
  ));
});

module.exports = {
  BuildNodeRunner,
  buildNodeRunner,
};
