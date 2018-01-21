const { provider } = require('jimple');
/**
 * This is an special service as it doesn't do anything but returning another services: Build
 * engines are what Woopack uses to bundle targets, since they depend on a target configuration,
 * we can't have huge `if` that checks the value of the setting in order to retrieve the required
 * service.
 * The solution we came up with is that the engines services all respect an interface and register
 * themselves with the name `[name]BuildEngine` so the rest of the app can use this service to
 * retrieve them by name.
 */
class BuildEngines {
  /**
   * Class constructor.
   * @param {Woopack} app The main app container. Used to retrieve the build engines services.
   */
  constructor(app) {
    /**
     * A local reference for the main app container.
     * @type {Woopack}
     */
    this.app = app;
  }
  /**
   * Get a build engine service.
   * @param {String} name The engine name.
   * @return {BuildEngine}
   * @throws {Error} If the service is not registered.
   */
  getEngine(name) {
    return this.app.get(`${name}BuildEngine`);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildEngines` as the `buildEngines` service.
 * @example
 * // Register it on the container
 * container.register(buildEngines);
 * // Getting access to the service instance
 * const buildEngines = container.get('buildEngines');
 * @type {Provider}
 */
const buildEngines = provider((app) => {
  app.set('buildEngines', () => new BuildEngines(app));
});

module.exports = {
  BuildEngines,
  buildEngines,
};
