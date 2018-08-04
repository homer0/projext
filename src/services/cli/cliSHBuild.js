const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the _'real build command'_. This is a private command the shell script executes in order
 * to get a list of commands to run.
 * @extends {CLICommand}
 * @todo This whole class needs a refactor (args and params are the same!).
 */
class CLISHBuildCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Builder}                      builder                    Needed to generate a target
   *                                                                  build command.
   * @param {CLICleanCommand}              cliCleanCommand            Needed to generate the command
   *                                                                  that cleans a target files.
   * @param {CLICopyProjectFilesCommand}   cliCopyProjectFilesCommand Needed to generate the command
   *                                                                  to copy the project files if
   *                                                                  the feature of copying on
   *                                                                  build is enabled.
   * @param {CLIRevisionCommand}           cliRevisionCommand         Needed to generate the command
   *                                                                  that creates the revision file
   *                                                                  if the feature of generating
   *                                                                  it on build is enabled.
   * @param {CLISHCopyCommand}             cliSHCopyCommand           Needed to generate the command
   *                                                                  to copy the target files if
   *                                                                  the target doesn't require
   *                                                                  bundling.
   * @param {CLISHNodeRunCommand}          cliSHNodeRunCommand        Needed to generate the command
   *                                                                  to run a Node target if the
   *                                                                  `run` option is used.
   * @param {CLISHTranspileCommand}        cliSHTranspileCommand      Needed to generate the command
   *                                                                  to transpile a Node target
   *                                                                  code.
   * @param {Events}                       events                     Used to reduce the list of
   *                                                                  commands generated.
   * @param {ProjectConfigurationSettings} projectConfiguration       Used to read and validate the
   *                                                                  features.
   * @param {Targets}                      targets                    Used to get the targets
   *                                                                  information.
   */
  constructor(
    builder,
    cliCleanCommand,
    cliCopyProjectFilesCommand,
    cliRevisionCommand,
    cliSHCopyCommand,
    cliSHNodeRunCommand,
    cliSHTranspileCommand,
    events,
    projectConfiguration,
    targets
  ) {
    super();
    /**
     * A local reference for the `builder` service.
     * @type {Builder}
     */
    this.builder = builder;
    /**
     * A local reference for the `cliCleanCommand` service.
     * @type {CliCleanCommand}
     */
    this.cliCleanCommand = cliCleanCommand;
    /**
     * A local reference for the `cliCopyProjectFilesCommand` service.
     * @type {CliCopyProjectFilesCommand}
     */
    this.cliCopyProjectFilesCommand = cliCopyProjectFilesCommand;
    /**
     * A local reference for the `cliRevisionCommand` service.
     * @type {CliRevisionCommand}
     */
    this.cliRevisionCommand = cliRevisionCommand;
    /**
     * A local reference for the `cliSHCopyCommand` service.
     * @type {CliSHCopyCommand}
     */
    this.cliSHCopyCommand = cliSHCopyCommand;
    /**
     * A local reference for the `cliSHNodeRunCommand` service.
     * @type {CliSHNodeRunCommand}
     */
    this.cliSHNodeRunCommand = cliSHNodeRunCommand;
    /**
     * A local reference for the `cliSHTranspileCommand` service.
     * @type {CliSHTranspileCommand}
     */
    this.cliSHTranspileCommand = cliSHTranspileCommand;
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * All the project settings.
     * @type {ProjectConfigurationSettings}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-build [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Get the build commands for the shell program to execute';
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
  }
  /**
   * Handle the execution of the command and outputs the list of commands to run.
   * This method emits the event reducer `build-target-commands-list` with the list of commands,
   * the target information, the type of build and whether or not the target should be executed;
   * and it expects a list of commands on return.
   * @param {?string} name           The name of the target.
   * @param {Command} command        The executed command (sent by `commander`).
   * @param {Object}  options        The command options.
   * @param {string}  options.type   The type of build.
   * @param {boolean} options.run    Whether or not the target also needs to be executed.
   * @param {boolean} options.watch  Whether or not the target files will be watched.
   * @param {Object}  unknownOptions A dictionary of extra options that command may have received.
   */
  handle(name, command, options, unknownOptions) {
    const { type } = options;
    // Get the target information
    const target = name ?
      // If the target doesn't exist, this will throw an error.
      this.targets.getTarget(name) :
      // Get the default target or throw an error if the project doesn't have targets.
      this.targets.getDefaultTarget();
    // Check if there's a reason for the target to be executed.
    const run = type === 'development' && (target.runOnDevelopment || options.run);
    // Check if the target files should be watched.
    const watch = !run && (target.watch[type] || options.watch);
    /**
     * Check whether or not a build will be created. This is always `true` for browser targets, but
     * it can be `false` for Node targets if bundling and transpiling is disabled.
     */
    let build = true;
    if (target.is.node) {
      build = (
        type === 'production' ||
        target.bundle ||
        target.transpile
      );
    }
    // Define the parameters object to send to the other methods.
    const params = {
      target,
      type,
      run,
      build,
      watch,
    };

    // Based on the target type, get the list of commands.
    const commands = target.is.node ?
      this.getCommandsForNodeTarget(params) :
      this.getCommandsForBrowserTarget(params);
    // Reduce the list of commands.
    const output = this.events.reduce(
      'build-target-commands-list',
      commands.filter((cmd) => !!cmd),
      params,
      unknownOptions
    )
    // Join the commands on a single string.
    .join(';');
    // Outputs all the commands
    this.output(output);
  }
  /**
   * Get the build (and run) commands for a Node target.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {Array}
   */
  getCommandsForNodeTarget(params) {
    // Get the base commands.
    const commands = [
      this.getCleanCommandIfNeeded(params),
      this.getBuildCommandIfNeeded(params),
      this.getCopyCommand(params),
      this.getTranspileCommand(params),
    ];
    // If the target won't be executed nor their files will be watched...
    if (!params.run && !params.watch) {
      // ...push the commands to create the revision file and copy the project files.
      commands.push(...[
        this.getRevisionCommand(params),
        this.getCopyProjectFilesCommand(params),
      ]);
    } else if (!params.target.bundle) {
      /**
       * If the target will be executed or their files will be watched, and is not a bundled target,
       * push the command to either run or watch. The reason it's handled this ways is because if
       * the target is bundled, the build engine will take care of the execution/watch.
       */
      if (params.run) {
        // Run the target with `nodemon`.
        commands.push(this.getNodeRunCommand(params));
      } else {
        // Watch the target with `watchpack`.
        commands.push(this.getNodeWatchCommand(params));
      }
    }

    return commands;
  }
  /**
   * Get the build (and run) commands for a browser target.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {Array}
   */
  getCommandsForBrowserTarget(params) {
    // Get the base commands.
    const commands = [
      this.getCleanCommandIfNeeded(params),
      this.getBuildCommandIfNeeded(params),
    ];
    // If the target won't be executed...
    if (!params.run && !params.watch) {
      // ...push the commands to create the revision file and copy the project files.
      commands.push(...[
        this.getRevisionCommand(params),
        this.getCopyProjectFilesCommand(params),
      ]);
    }

    return commands;
  }
  /**
   * Get the command to remove the previous build files of a target, but only if the target will be
   * build, otherwise, it will return an empty string.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getCleanCommandIfNeeded(params) {
    let command = '';
    if (params.build && params.target.cleanBeforeBuild) {
      command = this.cliCleanCommand.generate({
        target: params.target.name,
      });
    }

    return command;
  }
  /**
   * Get the command to actually build a target.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getBuildCommandIfNeeded(params) {
    return this.builder.getTargetBuildCommand(
      params.target,
      params.type,
      params.run,
      params.watch
    );
  }
  /**
   * Get the command to copy a target files, but only if the target will be _'build'_ (transpiled
   * counts) and it doesn't support bundling, otherwise, it will return an empty string.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getCopyCommand(params) {
    let command = '';
    if (params.build && !params.target.bundle) {
      command = this.cliSHCopyCommand.generate({
        target: params.target.name,
        type: params.type,
      });
    }

    return command;
  }
  /**
   * Get the command to transpile a target files, but only if the target will be _'build'_
   * (transpiled counts) and it doesn't support bundling, otherwise, it will return an empty string.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getTranspileCommand(params) {
    let command = '';
    if (params.build && !params.target.bundle) {
      command = this.cliSHTranspileCommand.generate({
        target: params.target.name,
        type: params.type,
      });
    }

    return command;
  }
  /**
   * Get the command to run a Node target.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getNodeRunCommand(params) {
    return this.cliSHNodeRunCommand.generate({
      target: params.target.name,
    });
  }
  /**
   * Get the command to watch a Node target.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getNodeWatchCommand() {
    return '';
  }
  /**
   * Get the command to create the revision file, but only if the feature is enabled, otherwise,
   * it will return an empty string.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getRevisionCommand(params) {
    const {
      enabled,
      createRevisionOnBuild,
    } = this.projectConfiguration.version.revision;
    let command = '';
    if (enabled && createRevisionOnBuild.enabled) {
      const revisionEnvCheck = !createRevisionOnBuild.onlyOnProduction ||
        (createRevisionOnBuild.onlyOnProduction && params.type === 'production');
      const revisionTargetCheck = !createRevisionOnBuild.targets.length ||
        createRevisionOnBuild.targets.includes(params.target.name);

      if (revisionEnvCheck && revisionTargetCheck) {
        command = this.cliRevisionCommand.generate();
      }
    }

    return command;
  }
  /**
   * Get the command to copy the project files, but only if the feature is enabled, otherwise,
   * it will return an empty string.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   */
  getCopyProjectFilesCommand(params) {
    const { enabled, copyOnBuild } = this.projectConfiguration.copy;
    let command = '';
    if (enabled && copyOnBuild.enabled) {
      const copyEnvCheck = !copyOnBuild.onlyOnProduction ||
        (copyOnBuild.onlyOnProduction && params.type === 'production');
      const copyTargetCheck = !copyOnBuild.targets.length ||
        copyOnBuild.targets.includes(params.target.name);

      if (copyEnvCheck && copyTargetCheck) {
        command = this.cliCopyProjectFilesCommand.generate();
      }
    }

    return command;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHBuildCommand` as the `cliSHBuildCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHBuildCommand);
 * // Getting access to the service instance
 * const cliSHBuildCommand = container.get('cliSHBuildCommand');
 * @type {Provider}
 */
const cliSHBuildCommand = provider((app) => {
  app.set('cliSHBuildCommand', () => new CLISHBuildCommand(
    app.get('builder'),
    app.get('cliCleanCommand'),
    app.get('cliCopyProjectFilesCommand'),
    app.get('cliRevisionCommand'),
    app.get('cliSHCopyCommand'),
    app.get('cliSHNodeRunCommand'),
    app.get('cliSHTranspileCommand'),
    app.get('events'),
    app.get('projectConfiguration').getConfig(),
    app.get('targets')
  ));
});

module.exports = {
  CLISHBuildCommand,
  cliSHBuildCommand,
};
