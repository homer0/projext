const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a fake command the app uses to show the information of the inspect task. In reality,
 * this command is handled by a shell script.
 * @extends {CLICommand}
 */
class CLIInspectCommand extends CLICommand {
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
    this.command = 'inspect [target]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Run a Node target on a development build type and enable the inspector';
    /**
     * Enable unknown options so other services can customize the run command.
     * @type {boolean}
     */
    this.allowUnknownOptions = true;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLIInspectCommand` as the `cliInspectCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliInspectCommand);
 * // Getting access to the service instance
 * const cliInspectCommand = container.get('cliInspectCommand');
 * @type {Provider}
 */
const cliInspectCommand = provider((app) => {
  app.set('cliInspectCommand', () => new CLIInspectCommand());
});

module.exports = {
  CLIInspectCommand,
  cliInspectCommand,
};
