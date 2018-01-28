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
   * @param {BuildVersion} buildVersion To call the method that writes the revision file.
   */
  constructor(buildVersion) {
    super();
    /**
     * A local reference for the `buildVersion` service function.
     * @type {BuildVersion}
     */
    this.buildVersion = buildVersion;
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
   * Handles the execution of the command and creates the file.
   * @return {Promise<string,Error>}
   */
  handle() {
    return this.buildVersion.createRevision();
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
    app.get('buildVersion')
  ));
});

module.exports = {
  CLIRevisionCommand,
  cliRevisionCommand,
};
