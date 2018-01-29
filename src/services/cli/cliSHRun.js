const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');
/**
 * This is the _'real run command'_. This is a private command the shell script executes in order
 * to get a list of commands it should execute.
 * @extends {CLICommand}
 * @implements {CLICommand}
 */
class CLISHRunCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {CLIBuildCommand} cliBuildCommand The run command is actually an alias for the build
   *                                          command with the `--run` option flag set to true.
   */
  constructor(cliBuildCommand) {
    super();
    /**
     * A local reference for the `cliBuildCommand` service.
     * @type {CLIBuildCommand}
     */
    this.cliBuildCommand = cliBuildCommand;
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
  }
  /**
   * Handle the execution of the command and outputs the list of commands to run.
   * @param {string} target The name of the target.
   */
  handle(target) {
    this.output(this.cliBuildCommand.generate({
      target,
      type: 'development',
      run: true,
    }));
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
    app.get('cliBuildCommand')
  ));
});

module.exports = {
  CLISHRunCommand,
  cliSHRunCommand,
};
