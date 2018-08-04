const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the _'real watch command'_. This is a private command the shell script executes in order
 * to get a list of commands it should execute.
 * @extends {CLICommand}
 */
class CLISHWatchCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {CLIBuildCommand} cliBuildCommand The run command is actually an alias for the build
   *                                          command with the `--watch` option flag set to true.
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
    this.command = 'sh-watch [target]';
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
     * Enable unknown options so other services can customize the watch command.
     * @type {Boolean}
     */
    this.allowUnknownOptions = true;
    this.addOption(
      'type',
      '-t, --type [type]',
      'Which build type: development (default) or production',
      'development'
    );
  }
  /**
   * Handle the execution of the command and outputs the list of commands to run.
   * @param {?string} name           The name of the target.
   * @param {Command} command        The executed command (sent by `commander`).
   * @param {Object}  options        The command options.
   * @param {Object}  unknownOptions A dictionary of extra options that command may have received.
   */
  handle(name, command, options, unknownOptions) {
    const { type } = options;
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
        type,
        watch: true,
      }
    )));
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHWatchCommand` as the `cliSHWatchCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHWatchCommand);
 * // Getting access to the service instance
 * const cliSHWatchCommand = container.get('cliSHWatchCommand');
 * @type {Provider}
 */
const cliSHWatchCommand = provider((app) => {
  app.set('cliSHWatchCommand', () => new CLISHWatchCommand(
    app.get('cliBuildCommand'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHWatchCommand,
  cliSHWatchCommand,
};
