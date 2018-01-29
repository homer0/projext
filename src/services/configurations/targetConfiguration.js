const { provider } = require('jimple');
const ConfigurationFile = require('../../abstracts/configurationFile');
/**
 * This is a _'tricky'_ service as it only exists to be overwritten. It was created as a dynamic
 * way for a target to extend any configuration. It's service provider returns a function instead
 * of an instance, in which the plugin/service defines any path and then the service gets
 * instantiated.
 * @extends {ConfigurationFile}
 */
class TargetConfiguration extends ConfigurationFile {
  /**
   * Class constructor.
   * @param {string}            overwritePath     The path to the overwrite file.
   * @param {ConfigurationFile} baseConfiguration The configuration this will be extending.
   * @param {PathUtils}         pathUtils         Because `ConfigurationFile` needs it in order to
   *                                              build the overwrite path.`
   */
  constructor(overwritePath, baseConfiguration, pathUtils) {
    super(pathUtils, overwritePath, true, baseConfiguration);
  }
  /**
   * Return an empty object just to comply with the interface.
   * @return {Object}
   */
  createConfig() {
    return {};
  }
}
/**
 * The service provider that once registered on the app container will set an function to get
 * instance of `TargetConfiguration` as the `targetConfiguration` service.
 * @example
 * // Register it on the container
 * container.register(targetConfiguration);
 * // Getting access to the service function
 * const targetConfiguration = container.get('targetConfiguration');
 * // Generating an instance for an specific configurations
 * const myNewConfig = targetConfiguration('./overwrite-path.js', configToExtend).getConfig();
 * @type {Provider}
 */
const targetConfiguration = provider((app) => {
  app.set('targetConfiguration', () => (
    overwritePath,
    baseConfiguration
  ) => new TargetConfiguration(
    overwritePath,
    baseConfiguration,
    app.get('pathUtils')
  ));
});

module.exports = {
  TargetConfiguration,
  targetConfiguration,
};
