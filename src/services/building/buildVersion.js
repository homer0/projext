const { provider } = require('jimple');
/**
 * This service uses the project configuration settings in order manage the project version.
 */
class BuildVersion {
  /**
   * Class constructor.
   * @param {Events}                       events               To fire an event when the revision
   *                                                            file is created.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the `version` settings.
   * @param {VersionUtils}                 versionUtils         To load the version and write the
   *                                                            revision file.
   */
  constructor(events, projectConfiguration, versionUtils) {
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * All the project settings.
     * @type {ProjectConfigurationSettings}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference for the `versionUtils` service.
     * @type {VersionUtils}
     */
    this.versionUtils = versionUtils;
  }
  /**
   * Look for the project version first on the revision file, then on the environment variable and
   * finally fallbacks to `development` if none of the other could be found.
   * @return {string}
   */
  getVersion() {
    const { version } = this.projectConfiguration;
    return this.versionUtils.getVersion(
      version.revision.filename,
      version.environmentVariable
    );
  }
  /**
   * Create the revision file.
   * This method emits the `revision-file-created` event and sends the contents of the file as
   * a argument.
   * @param {boolean} [force=false] Force the service to create the file even if the feature
   *                                is disabled.
   * @return {Promise<string,Error>}
   */
  createRevision(force = false) {
    const { version } = this.projectConfiguration;
    const { revision } = version;
    let result;
    if (revision.enabled || force) {
      result = this.versionUtils.createRevisionFile(
        revision.filename,
        version.environmentVariable
      )
      .then((savedVersion) => {
        this.events.emit('revision-file-created', savedVersion);
        return savedVersion;
      });
    } else {
      const error = new Error('The revision feature is disabled on the project configuration');
      result = Promise.reject(error);
    }

    return result;
  }
  /**
   * Get the name of the variable where the build engine should define the version.
   * @return {string}
   */
  getDefinitionVariable() {
    return this.projectConfiguration.version.defineOn;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildVersion` as the `buildVersion` service.
 * @example
 * // Register it on the container
 * container.register(buildVersion);
 * // Getting access to the service instance
 * const buildVersion = container.get('buildVersion');
 * @type {Provider}
 */
const buildVersion = provider((app) => {
  app.set('buildVersion', () => new BuildVersion(
    app.get('events'),
    app.get('projectConfiguration').getConfig(),
    app.get('versionUtils')
  ));
});

module.exports = {
  BuildVersion,
  buildVersion,
};
