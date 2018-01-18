const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');
/**
 * This is a private command the shell script executes in order to transpile a target.
 * @extends {CLICommand}
 * @implements {CLICommand}
 */
class CLISHTranspileCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Builder} builder To copy the target files.
   */
  constructor(builder) {
    super();
    /**
     * A local reference to the `builder` service.
     * @type {Builder}
     */
    this.builder = builder;
    /**
     * The instruction needed to trigger the command.
     * @type {String}
     */
    this.command = 'sh-transpile-target [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {String}
     */
    this.description = 'Transpile a target code if needed';
    this.addOption(
      'type',
      '-t, --type [type]',
      'Which build type: development (default) or production',
      'development'
    );
    /**
     * Hide the command from the help interface.
     * @type {Boolean}
     */
    this.hidden = true;
  }
  /**
   * Handle the execution of the command and copies a target files.
   * @param {String}  target       The name of the target.
   * @param {Command} command      The executed command (sent by `commander`).
   * @param {Object}  options      The command options.
   * @param {String}  options.type The type of build.
   */
  handle(target, command, options) {
    return this.builder.transpileTarget(target, options.type);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHTranspileCommand` as the `cliSHTranspileCommand` service.
 * @example
 * // Register is on the container
 * container.register(cliSHTranspileCommand);
 * // Getting access to the service instance
 * const cliSHTranspileCommand = container.get('cliSHTranspileCommand');
 * @type {Provider}
 */
const cliSHTranspileCommand = provider((app) => {
  app.set('cliSHTranspileCommand', () => new CLISHTranspileCommand(app.get('builder')));
});

module.exports = {
  CLISHTranspileCommand,
  cliSHTranspileCommand,
};
