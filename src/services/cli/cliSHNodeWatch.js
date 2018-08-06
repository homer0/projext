const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes in order to watch a Node target with
 * `watchpack`.
 * @extends {CLICommand}
 */
class CLISHNodeWatchCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {BuildNodeWatcher} buildNodeWatcher To actually run a target.
   * @param {Targets}          targets         To get a target information.
   */
  constructor(buildNodeWatcher, targets) {
    super();
    /**
     * A local reference for the `buildNodeWatcher` service.
     * @type {BuildNodeRunner}
     */
    this.buildNodeWatcher = buildNodeWatcher;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-node-watch [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Watch a Node target that wasn\'t bundled';
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
   * @return {Watchpack}
   */
  handle(name) {
    const target = this.targets.getTarget(name);
    return this.buildNodeWatcher.watchTarget(target);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHNodeWatchCommand` as the `cliSHNodeWatchCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHNodeWatchCommand);
 * // Getting access to the service instance
 * const cliSHNodeWatchCommand = container.get('cliSHNodeWatchCommand');
 * @type {Provider}
 */
const cliSHNodeWatchCommand = provider((app) => {
  app.set('cliSHNodeWatchCommand', () => new CLISHNodeWatchCommand(
    app.get('buildNodeWatcher'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHNodeWatchCommand,
  cliSHNodeWatchCommand,
};
