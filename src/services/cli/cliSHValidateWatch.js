const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes before running the watch command in order to
 * validate the arguments and throw any necessary error. The reason we do this in two separated
 * commands is that the shell script takes all the output of the run command and tries to execute
 * it, so we can't include execptions in there.
 * @extends {CLICommand}
 */
class CLISHValidateWatchCommand extends CLICommand {
  /**
   * @param {Targets} targets To validate a target existence.
   */
  constructor(targets) {
    super();
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-validate-watch [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Validate the arguments before the shell executes the task';
    /**
     * Hide the command from the help interface.
     * @type {boolean}
     */
    this.hidden = true;
    /**
     * Enable unknown options so other services can customize the watch command.
     * @type {boolean}
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
   * Handle the execution of the command and validate the target existence.
   * @param {?string} name The name of the target.
   */
  handle(name) {
    return name ?
      // If the target doesn't exist, this will throw an error.
      this.targets.getTarget(name) :
      // Get the default target or throw an error if the project doesn't have targets.
      this.targets.getDefaultTarget();
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHValidateWatchCommand` as the `cliSHValidateWatchCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHValidateWatchCommand);
 * // Getting access to the service instance
 * const cliSHValidateWatchCommand = container.get('cliSHValidateWatchCommand');
 * @type {Provider}
 */
const cliSHValidateWatchCommand = provider((app) => {
  app.set('cliSHValidateWatchCommand', () => new CLISHValidateWatchCommand(
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateWatchCommand,
  cliSHValidateWatchCommand,
};
