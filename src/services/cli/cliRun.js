const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');
/**
 * This is a fake command the app uses to show the information of the run task. In reality, this
 * command is handled by a shell script.
 * @extends {CLICommand}
 * @implements {CLICommand}
 */
class CLIRunCommand extends CLICommand {
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
    this.command = 'run [target]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Run a target on a development build type';
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLIRunCommand` as the `cliRunCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliRunCommand);
 * // Getting access to the service instance
 * const cliRunCommand = container.get('cliRunCommand');
 * @type {Provider}
 */
const cliRunCommand = provider((app) => {
  app.set('cliRunCommand', () => new CLIRunCommand());
});

module.exports = {
  CLIRunCommand,
  cliRunCommand,
};
