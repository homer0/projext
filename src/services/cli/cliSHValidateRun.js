const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes before running the run command in order to
 * validate the arguments and throw any necessary error. The reason we do this in two separated
 * commands is that the shell script takes all the output of the run command and tries to execute
 * it, so we can't include execptions in there.
 * @extends {CLICommand}
 */
class CLISHValidateRunCommand extends CLICommand {
  /**
   * Class constructor.
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
    this.command = 'sh-validate-run [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
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
     * @type {boolean}
     */
    this.hidden = true;
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
 * `CLISHValidateRunCommand` as the `cliSHValidateRunCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHValidateRunCommand);
 * // Getting access to the service instance
 * const cliSHValidateRunCommand = container.get('cliSHValidateRunCommand');
 * @type {Provider}
 */
const cliSHValidateRunCommand = provider((app) => {
  app.set('cliSHValidateRunCommand', () => new CLISHValidateRunCommand(
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateRunCommand,
  cliSHValidateRunCommand,
};
