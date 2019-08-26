const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a fake command the app uses to show the information of the analyze task. In reality,
 * this command is handled by a shell script.
 * @extends {CLICommand}
 */
class CLIAnalyzeCommand extends CLICommand {
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
    this.command = 'analyze [target]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Build a target that can be bundled and open the bundle analyzer';
    /**
     * Enable unknown options so other services can customize the run command.
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
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLIAnalyzeCommand` as the `cliAnalyzeCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliAnalyzeCommand);
 * // Getting access to the service instance
 * const cliAnalyzeCommand = container.get('cliAnalyzeCommand');
 * @type {Provider}
 */
const cliAnalyzeCommand = provider((app) => {
  app.set('cliAnalyzeCommand', () => new CLIAnalyzeCommand());
});

module.exports = {
  CLIAnalyzeCommand,
  cliAnalyzeCommand,
};
