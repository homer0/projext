const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the command used on the CLI interface to remove a target file(s) or the entire
 * distribution directory.
 * @extends {CLICommand}
 */
class CLICleanCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Builder}      builder      Needed to remove a target files.
   * @param {BuildCleaner} buildCleaner Needed to remove the distribution directory.
   * @param {Targets}      targets      To get the default target in case none is specified.
   */
  constructor(builder, buildCleaner, targets) {
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
     * A local reference for the `targets` service function.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'clean [target]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Delete builded files from the distribution directory';
    this.addOption(
      'all',
      '-a, --all',
      'Delete the entire distribution directory',
      false
    );
  }
  /**
   * Handle the execution of the command.
   * @param {?string} name        The name of the target that will be removed from the distribution
   *                              directory. If none is specified, it will fallback to the default
   *                              target.
   * @param {Command} command     The executed command (sent by `commander`).
   * @param {Object}  options     The commands options.
   * @param {boolean} options.all If this is `true`, instead of just removing the target files, the
   *                              entire distribution directory will be deleted.
   * @return {Promise<undefined,Error>}
   */
  handle(name, command, options) {
    // Define the variable that will hold the return Promise.
    let result;
    // If the `all` flag was used...
    if (options.all) {
      // ...then remove the entire distribution directory.
      result = this.buildCleaner.cleanAll();
    } else {
      // ...otherwise, check if a target name was specified, or fallback to the default target.
      const target = name || this.targets.getDefaultTarget();
      // Set the method to remove the targets files as return Promise.
      result = this.builder.cleanTarget(target);
    }

    // Return the Promise for whichever clean method was used.
    return result;
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
    app.get('buildCleaner'),
    app.get('targets')
  ));
});

module.exports = {
  CLICleanCommand,
  cliCleanCommand,
};
