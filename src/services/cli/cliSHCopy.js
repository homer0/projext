const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes in order to copy a target files.
 * @extends {CLICommand}
 */
class CLISHCopyCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Builder} builder To copy the target files.
   */
  constructor(builder) {
    super();
    /**
     * A local reference for the `builder` service.
     * @type {Builder}
     */
    this.builder = builder;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-copy-target [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Copy a target files, only if the target requires' +
      'transpilation or the `type` argument is production';
    this.addOption(
      'type',
      '-t, --type [type]',
      'Which build type: development (default) or production',
      'development'
    );
    /**
     * Hide the command from the help interface.
     * @type {boolean}
     */
    this.hidden = true;
  }
  /**
   * Handle the execution of the command and copies a target files.
   * @param {string}  target       The name of the target.
   * @param {Command} command      The executed command (sent by `commander`).
   * @param {Object}  options      The command options.
   * @param {string}  options.type The type of build.
   */
  handle(target, command, options) {
    return this.builder.copyTarget(target, options.type);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHCopyCommand` as the `cliSHCopyCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHCopyCommand);
 * // Getting access to the service instance
 * const cliSHCopyCommand = container.get('cliSHCopyCommand');
 * @type {Provider}
 */
const cliSHCopyCommand = provider((app) => {
  app.set('cliSHCopyCommand', () => new CLISHCopyCommand(app.get('builder')));
});

module.exports = {
  CLISHCopyCommand,
  cliSHCopyCommand,
};
