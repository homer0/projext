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
     * @type {boolean}
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
    this.addOption(
      'inspect',
      '-i, --inspect',
      'Enables the Node inspector. It only works with Node targets',
      false
    );
  }
  /**
   * Handle the execution of the command and validate all the arguments.
   * @param {?string}                name     The name of the target.
   * @param {Command}                command  The executed command (sent by `commander`).
   * @param {CLIBuildCommandOptions} options  The command options.
   * @throws {Error} If the `inspect` option is used for a browser target.
   */
  handle(name, command, options) {
    const target = name ?
      // If the target doesn't exist, this will throw an error.
      this.targets.getTarget(name) :
      // Get the default target or throw an error if the project doesn't have targets.
      this.targets.getDefaultTarget();

    const useOptions = this._normalizeOptions(options, target);

    if (target.is.node) {
      const nodeValidations = this._getNodeTargetValidations(target, useOptions);
      if (nodeValidations.invalidBuild) {
        this.appLogger.warning(
          `The target '${target.name}' doesn't need bundling nor transpilation, ` +
          'so there\'s no need to build it'
        );
      } else if (nodeValidations.invalidWatch) {
        this.appLogger.warning(
          `The target '${target.name}' doesn't need bundling nor transpilation, ` +
          'so there\'s no need to watch it'
        );
      }
    } else if (useOptions.inspect) {
      throw new Error(`'${target.name}' is not a Node target, so it can't be inspected`);
    } else if (!(target.library && !useOptions.development)) {
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
  /**
   * Normalizes the options received by the command in order to resolve "impossible combinations",
   * like trying to analyze a target that is not for bundling or trying to inspect a browser
   * target.
   * @param {CLIBuildCommandOptions} options The command options.
   * @param {Target}                 target  The target information.
   * @return {CLIBuildCommandNormalizedOptions}
   * @access protected
   * @ignore
   */
  _normalizeOptions(options, target) {
    const development = options.type === 'development';
    const run = development && (target.runOnDevelopment || options.run);
    const watch = !run && (target.watch[options.type] || options.watch);
    const inspect = run && options.inspect;
    return {
      development,
      run,
      watch,
      inspect,
    };
  }
  /**
   * Get validations for an specific Node target based on the options the command recevied (and
   * normalized).
   * @param {Target}                           target  The target information.
   * @param {CLIBuildCommandNormalizedOptions} options The command (normalized) options.
   * @return {Object} A dictionary of "validation flags".
   * @property {Boolean} invalidBuild Whether or not there's no reason for building the target.
   * @property {Boolean} invalidWatch Whether or not there's no reason for watching the target.
   * @access protected
   * @ignore
   */
  _getNodeTargetValidations(target, options) {
    const invalidBuild = options.development &&
      !options.run &&
      !options.watch &&
      !target.bundle &&
      !target.transpile;
    const invalidWatch = !invalidBuild &&
      options.development &&
      !options.run &&
      options.watch &&
      !target.bundle &&
      !target.transpile;

    return {
      invalidBuild,
      invalidWatch,
    };
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
