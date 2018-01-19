const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');
/**
 * This is a private command the shell script executes before running the build command in order to
 * validate the arguments and throw any necessary error. The reason we do this in two separated
 * commands is that the shell script takes all the output of the build command and tries to execute,
 * so we can't include execptions in there.
 * @extends {CLICommand}
 * @implements {CLICommand}
 */
class CLISHValidateBuildCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Logger}  appLogger To inform the user if something goes wrong.
   * @param {Targets} targets   To validate a target existence.
   */
  constructor(appLogger, targets) {
    super();
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * The instruction needed to trigger the command.
     * @type {String}
     */
    this.command = 'sh-validate-build [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {String}
     */
    this.description = 'Validate the arguments before the shell executes the task';
    this.addOption(
      'type',
      '-t, --type [type]',
      'Which build type: development (default) or production',
      'development'
    );
    this.addOption(
      'run',
      '-r, --run',
      'Run the target after the build is completed. It only works when the ' +
        'build type is development',
      false
    );
    /**
     * Hide the command from the help interface.
     * @type {Boolean}
     */
    this.hidden = true;
  }
  /**
   * Handle the execution of the command and validate all the arguments.
   * @param {String}  name         The name of the target.
   * @param {Command} command      The executed command (sent by `commander`).
   * @param {Object}  options      The command options.
   * @param {String}  options.type The type of build.
   * @param {String}  options.type Whether or not the target should be executed.
   */
  handle(name, command, options) {
    const { run, type } = options;
    // If the target doesn't exist, this will throw an error.
    const target = this.targets.getTarget(name);

    if (
      target.is.node &&
      type === 'development' &&
      !run &&
      !target.runOnDevelopment &&
      !target.bundle &&
      !target.transpile
    ) {
      this.appLogger.warning(
        `The target '${name}' doesn't need bundling nor transpilation, ` +
        'so there\'s no need to build it'
      );
    }
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHValidateBuildCommand` as the `cliSHValidateBuildCommand` service.
 * @example
 * // Register is on the container
 * container.register(cliSHValidateBuildCommand);
 * // Getting access to the service instance
 * const cliSHValidateBuildCommand = container.get('cliSHValidateBuildCommand');
 * @type {Provider}
 */
const cliSHValidateBuildCommand = provider((app) => {
  app.set('cliSHValidateBuildCommand', () => new CLISHValidateBuildCommand(
    app.get('appLogger'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateBuildCommand,
  cliSHValidateBuildCommand,
};
