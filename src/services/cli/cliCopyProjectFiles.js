const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the command used on the CLI interface to copy the project files to the distribution
 * directory.
 * @extends {CLICommand}
 */
class CLICopyProjectFilesCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {BuildCopier} buildCopier Used to copy the files.
   */
  constructor(buildCopier) {
    super();
    /**
     * A local reference for the `buildCopier` service function.
     * @type {BuildCopier}
     */
    this.buildCopier = buildCopier;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'copy-project-files';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Copy the required project files into the build directory';
  }
  /**
   * Handle the execution of the command and copies the project files to the distribution directory.
   * @return {Promise<undefined,Error>}
   */
  handle() {
    return this.buildCopier.copyFiles();
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLICopyProjectFilesCommand` as the `cliCopyProjectFilesCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliCopyProjectFilesCommand);
 * // Getting access to the service instance
 * const cliCopyProjectFilesCommand = container.get('cliCopyProjectFilesCommand');
 * @type {Provider}
 */
const cliCopyProjectFilesCommand = provider((app) => {
  app.set('cliCopyProjectFilesCommand', () => new CLICopyProjectFilesCommand(
    app.get('buildCopier')
  ));
});

module.exports = {
  CLICopyProjectFilesCommand,
  cliCopyProjectFilesCommand,
};
