const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a fake command the app uses to show the information of the watch task. In reality, this
 * command is handled by a shell script.
 * @extends {CLICommand}
 */
class CLIWatchCommand extends CLICommand {
  /**
   * Class constructor.
   * @ignore
   */
  constructor() {
    super();
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'watch [target]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Run a target on a development build type';
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
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLIWatchCommand` as the `cliWatchCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliWatchCommand);
 * // Getting access to the service instance
 * const cliWatchCommand = container.get('cliWatchCommand');
 * @type {Provider}
 */
const cliWatchCommand = provider((app) => {
  app.set('cliWatchCommand', () => new CLIWatchCommand());
});

module.exports = {
  CLIWatchCommand,
  cliWatchCommand,
};
