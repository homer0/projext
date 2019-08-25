const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes before running the analyze command in order
 * to validate the arguments and throw any necessary error. The reason we do this in two separated
 * commands is that the shell script takes all the output of the run command and tries to execute
 * it, so we can't include execptions in there.
 * @extends {CLICommand}
 */
class CLISHValidateAnalyzeCommand extends CLICommand {
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
    this.command = 'sh-validate-analyze [target]';
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
     * Enable unknown options so other services can customize the run command.
     * @type {boolean}
     */
    this.allowUnknownOptions = true;
  }
  /**
   * Handle the execution of the command and validate the target existence.
   * @param {?string} name The name of the target.
   * @throws {Error} If the target type is `browser`.
   */
  handle(name) {
    const target = name ?
      // If the target doesn't exist, this will throw an error.
      this.targets.getTarget(name) :
      // Get the default target or throw an error if the project doesn't have targets.
      this.targets.getDefaultTarget();

    if (!target.is.browser && !target.bundle) {
      throw new Error(`'${target.name}' doesn't do bundling, so it can't be analyzed`);
    }

    return target;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHValidateAnalyzeCommand` as the `cliSHValidateAnalyzeCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHValidateAnalyzeCommand);
 * // Getting access to the service instance
 * const cliSHValidateAnalyzeCommand = container.get('cliSHValidateAnalyzeCommand');
 * @type {Provider}
 */
const cliSHValidateAnalyzeCommand = provider((app) => {
  app.set('cliSHValidateAnalyzeCommand', () => new CLISHValidateAnalyzeCommand(
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateAnalyzeCommand,
  cliSHValidateAnalyzeCommand,
};
