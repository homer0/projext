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
   * @param {function} buildNodeRunnerProcess To actually run a target process.
   */
  constructor(buildNodeRunnerProcess) {
    /**
     * A local reference to the `buildNodeRunnerProcess` service.
     * @type {function}
     */
    this.buildNodeRunnerProcess = buildNodeRunnerProcess;
  }
  /**
   * Run a target with Nodemon.
   * @param  {Target} target The target information.
   * @return {nodemon}
   * @throws {Error} If the target needs to be bundled.
   */
  runTarget(target) {
    if (target.bundle) {
      throw new Error(`${target.name} needs to be bundled in order to run`);
    }

    return target.transpile ?
      this._runWithTranspilation(target) :
      this._run(target);
  }
  /**
   * Runs a target that requires transpilation. It executes the file from the distribution
   * directory while it watches the source directory.
   * @param  {Target} target The target information.
   * @return {nodemon}
   */
  _runWithTranspilation(target) {
    const { paths: { source, build } } = target;
    const executable = path.join(build, target.entry.development);
    const watch = [build];
    this.buildNodeRunnerProcess(
      executable,
      watch,
      source,
      build,
      {}
    );
  }
  /**
   * Runs a target that doesn't require transpilation. It executes and watches the source directory.
   * @param  {Target} target The target information.
   * @return {nodemon}
   */
  _run(target) {
    const { paths: { source } } = target;
    const executable = path.join(source, target.entry.development);
    const watch = [source];
    this.buildNodeRunnerProcess(
      executable,
      watch,
      source,
      source,
      {}
    );
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildNodeRunner` as the `buildNodeRunner` service.
 * @example
 * // Register is on the container
 * container.register(buildNodeRunner);
 * // Getting access to the service instance
 * const buildNodeRunner = container.get('buildNodeRunner');
 * @type {Provider}
 */
const buildNodeRunner = provider((app) => {
  app.set('buildNodeRunner', () => new BuildNodeRunner(
    app.get('buildNodeRunnerProcess')
  ));
});

module.exports = {
  BuildNodeRunner,
  buildNodeRunner,
};
