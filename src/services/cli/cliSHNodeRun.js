const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes in order to run a Node target with `nodemon`.
 * @extends {CLICommand}
 */
class CLISHNodeRunCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {BuildNodeRunner} buildNodeRunner To actually run a target.
   * @param {Targets}         targets         To get a target information.
   */
  constructor(buildNodeRunner, targets) {
    super();
    /**
     * A local reference for the `buildNodeRunner` service.
     * @type {BuildNodeRunner}
     */
    this.buildNodeRunner = buildNodeRunner;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-node-run [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Run a Node target that wasn\'t bundled';
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
   * Handle the execution of the command and runs a Node target.
   * @param {string} name The name of the target.
   * @return {`nodemon`}
   */
  handle(name) {
    const target = this.targets.getTarget(name);
    return this.buildNodeRunner.runTarget(target);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHNodeRunCommand` as the `cliSHNodeRunCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHNodeRunCommand);
 * // Getting access to the service instance
 * const cliSHNodeRunCommand = container.get('cliSHNodeRunCommand');
 * @type {Provider}
 */
const cliSHNodeRunCommand = provider((app) => {
  app.set('cliSHNodeRunCommand', () => new CLISHNodeRunCommand(
    app.get('buildNodeRunner'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHNodeRunCommand,
  cliSHNodeRunCommand,
};
