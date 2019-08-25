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
   * @param {CLISHNodeWatchCommand}        cliSHNodeWatchCommand      Needed to generate the command
   *                                                                  to watch a Node target files
   *                                                                  if the `watch` option is used.
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
    buildTypeScriptHelper,
    cliCleanCommand,
    cliCopyProjectFilesCommand,
    cliRevisionCommand,
    cliSHCopyCommand,
    cliSHNodeRunCommand,
    cliSHNodeWatchCommand,
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
     * A local reference for the `buildTypeScriptHelper` service.
     * @type {BuildTypeScriptHelper}
     */
    this.buildTypeScriptHelper = buildTypeScriptHelper;
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
     * A local reference for the `cliSHNodeWatchCommand` service.
     * @type {CliSHNodeWatchCommand}
     */
    this.cliSHNodeWatchCommand = cliSHNodeWatchCommand;
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
    this.addOption(
      'inspect',
      '-i, --inspect',
      'Enables the Node inspector. It only works when running Node targets',
      false
    );
    this.addOption(
      'analyze',
      '-a, --analyze',
      'Enables the bundle analyzer. It only works with targets with bundling',
      false
    );
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
  }
  /**
   * Handle the execution of the command and outputs the list of commands to run.
   * This method emits the event reducer `build-target-commands-list` with the list of commands,
   * the target information, the type of build and whether or not the target should be executed;
   * and it expects a list of commands on return.
   * @param {?string} name             The name of the target.
   * @param {Command} command          The executed command (sent by `commander`).
   * @param {Object}  options          The command options.
   * @param {string}  options.type     The type of build.
   * @param {boolean} options.run      Whether or not the target also needs to be executed.
   * @param {boolean} options.watch    Whether or not the target files will be watched.
   * @param {boolean} options.inspect  Whether or not the target will be inspected.
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

    // Check if there's a reason to analyze the target bundle.
    const analyze = options.analyze && (target.is.browser || target.bundle);
    // Check if there's a reason for the target to be executed.
    const run = !analyze && type === 'development' && (target.runOnDevelopment || options.run);
    // Check if there's a reason for the Node inspector to be enabled.
    const inspect = run && target.is.node && (target.inspect.enabled || options.inspect);
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
      inspect,
      analyze,
    };

    // Based on the target type, get the list of commands.
    const commands = target.is.node ?
      this._getCommandsForNodeTarget(params) :
      this._getCommandsForBrowserTarget(params);
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
   * @access protected
   * @ignore
   */
  _getCommandsForNodeTarget(params) {
    // Get the base commands.
    const commands = [
      this._getCleanCommandIfNeeded(params),
      this._getBuildCommandIfNeeded(params),
      this._getCopyCommandIfNeeded(params),
      this._getTranspileCommandIfNeeded(params),
      this._getTypeScriptDeclarationsCommandIfNeeded(params),
    ];
    // If the target won't be executed nor their files will be watched...
    if (!params.run && !params.watch) {
      // ...push the commands to create the revision file and copy the project files.
      commands.push(...[
        this._getRevisionCommandIfNeeded(params),
        this._getCopyProjectFilesCommand(params),
      ]);
    } else if (!params.target.bundle) {
      /**
       * If the target will be executed or their files will be watched, and is not a bundled target,
       * push the command to either run or watch. The reason it's handled this ways is because if
       * the target is bundled, the build engine will take care of the execution/watch.
       */
      if (params.run) {
        // Run the target with `nodemon`.
        commands.push(this._getNodeRunCommand(params));
      } else if (params.type === 'production' || params.target.transpile) {
        // Watch the target with `watchpack`.
        commands.push(this._getNodeWatchCommand(params));
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
   * @access protected
   * @ignore
   */
  _getCommandsForBrowserTarget(params) {
    // Get the base commands.
    const commands = [
      this._getCleanCommandIfNeeded(params),
      this._getBuildCommandIfNeeded(params),
      this._getTypeScriptDeclarationsCommandIfNeeded(params),
    ];
    // If the target won't be executed...
    if (!params.run && !params.watch) {
      // ...push the commands to create the revision file and copy the project files.
      commands.push(...[
        this._getRevisionCommandIfNeeded(params),
        this._getCopyProjectFilesCommand(params),
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
   * @access protected
   * @ignore
   */
  _getCleanCommandIfNeeded(params) {
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
   * @access protected
   * @ignore
   */
  _getBuildCommandIfNeeded(params) {
    return this.builder.getTargetBuildCommand(
      params.target,
      params.type,
      params.run,
      params.watch,
      params.inspect,
      params.analyze
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
   * @access protected
   * @ignore
   */
  _getCopyCommandIfNeeded(params) {
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
   * @access protected
   * @ignore
   */
  _getTranspileCommandIfNeeded(params) {
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
   * Get the command to generate a TypeScript target type declarations, but only if the target
   * uses TypeScript, won't run and won't be watched: The idea is to generate the declarations only
   * when you build the target and not during all the development process.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getTypeScriptDeclarationsCommandIfNeeded(params) {
    let command = '';
    if (
      params.target.typeScript &&
      params.build &&
      !params.run &&
      !params.watch
    ) {
      command = this.buildTypeScriptHelper.getDeclarationsCommand(params.target);
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
   * @access protected
   * @ignore
   */
  _getNodeRunCommand(params) {
    return this.cliSHNodeRunCommand.generate({
      target: params.target.name,
      inspect: params.inspect,
    });
  }
  /**
   * Get the command to watch a Node target.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getNodeWatchCommand(params) {
    return this.cliSHNodeWatchCommand.generate({
      target: params.target.name,
    });
  }
  /**
   * Get the command to create the revision file, but only if the feature is enabled, otherwise,
   * it will return an empty string.
   * @param {CLIBuildCommandParams} params A dictionary with all the required information the
   *                                       service needs to run the command: The target
   *                                       information, the build type, whether or not the target
   *                                       will be executed, etc.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getRevisionCommandIfNeeded(params) {
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
   * @access protected
   * @ignore
   */
  _getCopyProjectFilesCommand(params) {
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
    app.get('buildTypeScriptHelper'),
    app.get('cliCleanCommand'),
    app.get('cliCopyProjectFilesCommand'),
    app.get('cliRevisionCommand'),
    app.get('cliSHCopyCommand'),
    app.get('cliSHNodeRunCommand'),
    app.get('cliSHNodeWatchCommand'),
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
