const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the _'real run command'_. This is a private command the shell script executes in order
 * to get a list of commands it should execute.
 * @extends {CLICommand}
 */
class CLISHRunCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {CLIBuildCommand} cliBuildCommand The run command is actually an alias for the build
   *                                          command with the `--run` option flag set to true.
   * @param {Targets}         targets         To get the name of the default target if no other is
   *                                          specified.
   */
  constructor(cliBuildCommand, targets) {
    super();
    /**
     * A local reference for the `cliBuildCommand` service.
     * @type {CLIBuildCommand}
     */
    this.cliBuildCommand = cliBuildCommand;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-run [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Get the build commands for the shell program to execute';
    /**
     * Hide the command from the help interface.
     * @type {boolean}
     */
    this.hidden = true;
    /**
     * Enable unknown options so other services can customize the run command.
     * @type {Boolean}
     */
    this.allowUnknownOptions = true;
  }
  /**
   * Handle the execution of the command and outputs the list of commands to run.
   * @param {?string} name The name of the target.
   * @param {Command} command        The executed command (sent by `commander`).
   * @param {Object}  options        The command options.
   * @param {Object}  unknownOptions A dictionary of extra options that command may have received.
   */
  handle(name, command, options, unknownOptions) {
    const target = name ?
      // If the target doesn't exist, this will throw an error.
      this.targets.getTarget(name) :
      // Get the default target or throw an error if the project doesn't have targets.
      this.targets.getDefaultTarget();

    this.output(this.cliBuildCommand.generate(Object.assign(
      {},
      unknownOptions,
      {
        target: target.name,
        type: 'development',
        run: true,
      }
    )));
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHRunCommand` as the `cliSHRunCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHRunCommand);
 * // Getting access to the service instance
 * const cliSHRunCommand = container.get('cliSHRunCommand');
 * @type {Provider}
 */
const cliSHRunCommand = provider((app) => {
  app.set('cliSHRunCommand', () => new CLISHRunCommand(
    app.get('cliBuildCommand'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHRunCommand,
  cliSHRunCommand,
};
