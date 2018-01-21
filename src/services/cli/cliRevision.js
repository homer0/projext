const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');
/**
 * This is the command used on the CLI interface to create the revision file.
 * @extends {CLICommand}
 * @implements {CLICommand}
 */
class CLIRevisionCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Events}               events               To trigger an event informing the file was
   *                                                    created.
   * @param {ProjectConfiguration} projectConfiguration To read the settings and verify that a file
   *                                                    needs to be created.
   * @param {VersionUtils}         versionUtils         To create the file.
   */
  constructor(events, projectConfiguration, versionUtils) {
    super();
    /**
     * A local reference for the `events` service function.
     * @type {Events}
     */
    this.events = events;
    /**
     * A local reference for the `projectConfiguration` service function.
     * @type {ProjectConfiguration}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference for the `versionUtils` service function.
     * @type {VersionUtils}
     */
    this.versionUtils = versionUtils;
    /**
     * The instruction needed to trigger the command.
     * @type {String}
     */
    this.command = 'create-revision';
    /**
     * A description of the command for the help interface.
     * @type {String}
     */
    this.description = 'Create the revision file with the project version';
  }
  /**
   * Handle the execution of the command and creates the file.
   * This method emits the `revision-file-created` event and sends the contents of the file as
   * a argument.
   * @return {Promise<String,Error>}
   * @throws {Error} if the feature is disabled.
   * @todo Throws and error and returns a Promise? It should have only one error interface.
   */
  handle() {
    const { version: { revision } } = this.projectConfiguration;
    if (!revision.enabled) {
      throw new Error('The revision feature is disabled on the project configuration');
    }

    return this.versionUtils.createRevisionFile(revision.filename)
    .then((version) => {
      this.events.emit('revision-file-created', version);
      return version;
    });
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLIRevisionCommand` as the `cliRevisionCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliRevisionCommand);
 * // Getting access to the service instance
 * const cliRevisionCommand = container.get('cliRevisionCommand');
 * @type {Provider}
 */
const cliRevisionCommand = provider((app) => {
  app.set('cliRevisionCommand', () => new CLIRevisionCommand(
    app.get('events'),
    app.get('projectConfiguration').getConfig(),
    app.get('versionUtils')
  ));
});

module.exports = {
  CLIRevisionCommand,
  cliRevisionCommand,
};
