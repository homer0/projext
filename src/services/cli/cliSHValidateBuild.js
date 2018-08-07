const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes before running the build command in order to
 * validate the arguments and throw any necessary error. The reason we do this in two separated
 * commands is that the shell script takes all the output of the build command and tries to execute
 * it, so we can't include execptions in there.
 * @extends {CLICommand}
 */
class CLISHValidateBuildCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Logger}      appLogger   To inform the user if something goes wrong.
   * @param {Targets}     targets     To validate a target existence.
   * @param {TargetsHTML} targetsHTML To validate a browser target HTML file.
   * @param {TempFiles}   tempFiles   To validate that the temp directory can be created.
   */
  constructor(appLogger, targets, targetsHTML, tempFiles) {
    super();
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * A local reference for the `targetsHTML` service.
     * @type {TargetsHTML}
     */
    this.targetsHTML = targetsHTML;
    /**
     * A local reference for the `tempFiles` service.
     * @type {TempFiles}
     */
    this.tempFiles = tempFiles;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-validate-build [target]';
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
     * Enable unknown options so other services can customize the build command.
     * @type {Boolean}
     */
    this.allowUnknownOptions = true;
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
    this.addOption(
      'watch',
      '-w, --watch',
      'Rebuild the target every time one of its files changes. It only works ' +
        'when the build type is development',
      false
    );
  }
  /**
   * Handle the execution of the command and validate all the arguments.
   * @param {?string} name          The name of the target.
   * @param {Command} command       The executed command (sent by `commander`).
   * @param {Object}  options       The command options.
   * @param {string}  options.type  The type of build.
   * @param {string}  options.run   Whether or not the target should be executed.
   * @param {boolean} options.watch Whether or not the target files will be watched.
   */
  handle(name, command, options) {
    const { type } = options;
    const target = name ?
      // If the target doesn't exist, this will throw an error.
      this.targets.getTarget(name) :
      // Get the default target or throw an error if the project doesn't have targets.
      this.targets.getDefaultTarget();

    const development = type === 'development';
    const run = development && (target.runOnDevelopment || options.run);
    const watch = !run && (target.watch[type] || options.watch);

    if (target.is.node) {
      if (
        development &&
        !run &&
        !watch &&
        !target.bundle &&
        !target.transpile
      ) {
        this.appLogger.warning(
          `The target '${target.name}' doesn't need bundling nor transpilation, ` +
          'so there\'s no need to build it'
        );
      } else if (
        development &&
        !run &&
        watch &&
        !target.bundle &&
        !target.transpile
      ) {
        this.appLogger.warning(
          `The target '${target.name}' doesn't need bundling nor transpilation, ` +
          'so there\'s no need to watch it'
        );
      }
    } else if (!(target.library && type === 'production')) {
      this.tempFiles.ensureDirectorySync();
      const htmlStatus = this.targetsHTML.validate(target);
      if (!htmlStatus.exists) {
        this.appLogger.warning(
          `The target '${target.name}' doesn't have an HTML template, projext will generate ` +
          'one for this build, but it would be best for you to create one. You can use the ' +
          '\'generate\' command'
        );
      }
    }
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHValidateBuildCommand` as the `cliSHValidateBuildCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHValidateBuildCommand);
 * // Getting access to the service instance
 * const cliSHValidateBuildCommand = container.get('cliSHValidateBuildCommand');
 * @type {Provider}
 */
const cliSHValidateBuildCommand = provider((app) => {
  app.set('cliSHValidateBuildCommand', () => new CLISHValidateBuildCommand(
    app.get('appLogger'),
    app.get('targets'),
    app.get('targetsHTML'),
    app.get('tempFiles')
  ));
});

module.exports = {
  CLISHValidateBuildCommand,
  cliSHValidateBuildCommand,
};
