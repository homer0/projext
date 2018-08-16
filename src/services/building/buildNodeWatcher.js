const { provider } = require('jimple');
/**
 * This service provides a simple interface for watching targets using `watchpack`.
 * The actual service that does the _'watching'_ is `buildNodeWatcherProcess`, but this
 * one takes care of reading and processing a target settings before telling the other service
 * to start watching.
 */
class BuildNodeWatcher {
  /**
   * @param {BuildNodeWatcherProcess#run} buildNodeWatcherProcess To actually watch a target files.
   * @param {Targets}                     targets                 To get the information of the
   *                                                              included targets.
   */
  constructor(buildNodeWatcherProcess, targets) {
    /**
     * A local reference for the `buildNodeWatcherProcess` service.
     * @type {BuildNodeWatcherProcess#run}
     */
    this.buildNodeWatcherProcess = buildNodeWatcherProcess;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
  }
  /**
   * Watch a target.
   * @param  {Target} target The target information.
   * @return {Watchpack}
   * @throws {Error} If the target needs to be bundled.
   * @throws {Error} If one of the included targets requires bundling.
   */
  watchTarget(target) {
    if (target.bundle) {
      throw new Error(`${target.name} needs to be bundled`);
    }

    const {
      includeTargets,
      transpile,
      paths: { source, build },
    } = target;
    const watch = [source];
    const transpilationPaths = [];
    const copyPaths = [];
    const targetPathSettings = {
      from: source,
      to: build,
    };

    if (transpile) {
      transpilationPaths.push(targetPathSettings);
    } else {
      copyPaths.push(targetPathSettings);
    }

    includeTargets.forEach((name) => {
      const subTarget = this.targets.getTarget(name);
      if (subTarget.bundle) {
        const errorMessage = `The target ${name} requires bundling so it can't be ` +
          `included by ${target.name}`;
        throw new Error(errorMessage);
      } else {
        const pathSettings = {
          from: subTarget.paths.source,
          to: subTarget.paths.build,
        };
        watch.push(pathSettings.from);
        if (subTarget.transpile) {
          transpilationPaths.push(pathSettings);
        } else {
          copyPaths.push(pathSettings);
        }
      }
    });

    return this.buildNodeWatcherProcess(
      watch,
      transpilationPaths,
      copyPaths
    );
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildNodeWatcher` as the `buildNodeWatcher` service.
 * @example
 * // Register it on the container
 * container.register(buildNodeWatcher);
 * // Getting access to the service instance
 * const buildNodeWatcher = container.get('buildNodeWatcher');
 * @type {Provider}
 */
const buildNodeWatcher = provider((app) => {
  app.set('buildNodeWatcher', () => new BuildNodeWatcher(
    app.get('buildNodeWatcherProcess'),
    app.get('targets')
  ));
});

module.exports = {
  BuildNodeWatcher,
  buildNodeWatcher,
};
