const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');
/**
 * This is the command used on the CLI interface to remove a target file(s) or the entire
 * distribution directory.
 * @extends {CLICommand}
 * @implements {CLICommand}
 */
class CLICleanCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Builder}      builder      Needed to remove a target files.
   * @param {BuildCleaner} buildCleaner Needed to remove the distribution directory.
   */
  constructor(builder, buildCleaner) {
    super();
    /**
     * A local reference for the `builder` service function.
     * @type {Builder}
     */
    this.builder = builder;
    /**
     * A local reference for the `buildCleaner` service function.
     * @type {BuildCleaner}
     */
    this.buildCleaner = buildCleaner;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'clean [target]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Delete builded files for a target. If no target is ' +
      'specified, the build directory will be deleted';
  }
  /**
   * Handle the execution of the command.
   * @param {?string} target A target name. If specified, only that target files will be removed
   *                         from the distribution directory; otherwise, the entire directory will
   *                         be removed.
   * @return {Promise<undefined,Error>}
   */
  handle(target) {
    return target ?
      this.builder.cleanTarget(target) :
      this.buildCleaner.cleanAll();
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLICleanCommand` as the `cliCleanCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliCleanCommand);
 * // Getting access to the service instance
 * const cliCleanCommand = container.get('cliCleanCommand');
 * @type {Provider}
 */
const cliCleanCommand = provider((app) => {
  app.set('cliCleanCommand', () => new CLICleanCommand(
    app.get('builder'),
    app.get('buildCleaner')
  ));
});

module.exports = {
  CLICleanCommand,
  cliCleanCommand,
};
