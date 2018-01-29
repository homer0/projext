const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the _'real build command'_. This is a private command the shell script executes in order
 * to get a list of commands to run.
 * @extends {CLICommand}
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
    /**
     * Hide the command from the help interface.
     * @type {boolean}
     */
    this.hidden = true;
  }
  /**
   * Handle the execution of the command and outputs the list of commands to run.
   * This method emits the event reducer `build-target-commands-list` with the list of commands,
   * the target information, the type of build and whether or not the target should be executed;
   * and it expects a list of commands on return.
   * @param {string}  name         The name of the target.
   * @param {Command} command      The executed command (sent by `commander`).
   * @param {Object}  options      The command options.
   * @param {string}  options.type The type of build.
   * @param {boolean} options.run  Whether or not the target also needs to be executed.
   */
  handle(name, command, options) {
    const { type } = options;
    // Get the target information
    const target = this.targets.getTarget(name);
    // Check if there's a reason for the target to be executed.
    const run = type === 'development' && (target.runOnDevelopment || options.run);
    // Based on the target type, get the list of commands.
    const commands = target.is.node ?
      this.getCommandsForNodeTarget(target, type, run) :
      this.getCommandsForBrowserTarget(target, type, run);
    // Reduce the list of commands.
    const output = this.events.reduce(
      'build-target-commands-list',
      commands.filter((cmd) => !!cmd),
      target,
      type,
      run
    )
    // Join the commands on a single string.
    .join(';');
    // Outputs all the commands
    this.output(output);
  }
  /**
   * Get the build (and run) commands for a Node target.
   * @param {Target}  target The target information.
   * @param {string}  type   The intended build type: `development` or `production`.
   * @param {boolean} run    Whether or not the target needs to be executed.
   * @return {Array}
   */
  getCommandsForNodeTarget(target, type, run) {
    /**
     * Define the arguments that will be sent to the other methods. The reason we defined them this
     * way is because this is the format they'll be sent to the `.generate` method of the other
     * CLI commands.
     */
    const args = {
      target: target.name,
      type,
      run,
    };
    // Check whether or not the target needs to be build.
    const build = (
      type === 'production' ||
      target.bundle ||
      target.transpile
    );
    // Get the base commands.
    const commands = [
      this.getCleanCommandIfNeeded(args, target, type, build, run),
      this.getBuildCommandIfNeeded(args, target, type, build, run),
      this.getCopyCommand(args, target, type, build, run),
      this.getTranspileCommand(args, target, type, build, run),
    ];
    // If the target won't be executed...
    if (!run) {
      // ...push the commands to create the revision file and copy the project files.
      commands.push(...[
        this.getRevisionCommand(args, target, type),
        this.getCopyProjectFilesCommand(args, target, type),
      ]);
    } else if (!target.bundle) {
      /**
       * ...but if the target will run and is not a bundled target, push the command to run the
       * target with `nodemon`.
       */
      commands.push(this.getNodeRunCommand(args, target, type));
    }

    return commands;
  }
  /**
   * Get the build (and run) commands for a browser target.
   * @param {Target}  target The target information.
   * @param {string}  type   The intended build type: `development` or `production`.
   * @param {boolean} run    Whether or not the target needs to be executed.
   * @return {Array}
   */
  getCommandsForBrowserTarget(target, type, run) {
    /**
     * Define the arguments that will be sent to the other methods. The reason we defined them this
     * way is because this is the format they'll be sent to the `.generate` method of the other
     * CLI commands.
     */
    const args = {
      target: target.name,
      type,
      run,
    };
    // Get the base commands.
    const commands = [
      this.getCleanCommandIfNeeded(args, target, type, true, run),
      this.getBuildCommandIfNeeded(args, target, type, true, run),
    ];
    // If the target won't be executed...
    if (!run) {
      // ...push the commands to create the revision file and copy the project files.
      commands.push(...[
        this.getRevisionCommand(args, target, type),
        this.getCopyProjectFilesCommand(args, target, type),
      ]);
    }

    return commands;
  }
  /**
   * Get the command to remove the previous build files of a target, but only if the target will be
   * build, otherwise, it will return an empty string.
   * @param {Object}  args        The arguments ready to be sent to a `CLICommand` `generate`
   *                              method.
   * @param {string}  args.target The target name.
   * @param {string}  args.type   The intended build type: `development` or `production`.
   * @param {boolean} args.run    Whether or not the target will be executed.
   * @param {Target}  target      The target information.
   * @param {string}  type        The intended build type: `development` or `production`.
   * @param {boolean} build       Whether or not the target will be build.
   * @return {string}
   */
  getCleanCommandIfNeeded(args, target, type, build) {
    return build && target.cleanBeforeBuild ?
      this.cliCleanCommand.generate(args) :
      '';
  }
  /**
   * Get the command to actually build a target.
   * @param {Object}  args        The arguments ready to be sent to a `CLICommand` `generate`
   *                              method.
   * @param {string}  args.target The target name.
   * @param {string}  args.type   The intended build type: `development` or `production`.
   * @param {boolean} args.run    Whether or not the target will be executed.
   * @param {Target}  target      The target information.
   * @param {string}  type        The intended build type: `development` or `production`.
   * @param {boolean} build       Whether or not the target will be build.
   * @param {boolean} run         Whether or not the target will be executed.
   * @return {string}
   */
  getBuildCommandIfNeeded(args, target, type, build, run) {
    return this.builder.getTargetBuildCommand(target, type, run);
  }
  /**
   * Get the command to copy a target files, but only if the target will be _'build'_ (transpiled
   * counts) and it doesn't support bundling, otherwise, it will return an empty string.
   * @param {Object}  args        The arguments ready to be sent to a `CLICommand` `generate`
   *                              method.
   * @param {string}  args.target The target name.
   * @param {string}  args.type   The intended build type: `development` or `production`.
   * @param {boolean} args.run    Whether or not the target will be executed.
   * @param {Target}  target      The target information.
   * @param {string}  type        The intended build type: `development` or `production`.
   * @param {boolean} build       Whether or not the target will be build.
   * @return {string}
   */
  getCopyCommand(args, target, type, build) {
    return build && !target.bundle ?
      this.cliSHCopyCommand.generate(args) :
      '';
  }
  /**
   * Get the command to transpile a target files, but only if the target will be _'build'_
   * (transpiled counts) and it doesn't support bundling, otherwise, it will return an empty string.
   * @param {Object}  args        The arguments ready to be sent to a `CLICommand` `generate`
   *                              method.
   * @param {string}  args.target The target name.
   * @param {string}  args.type   The intended build type: `development` or `production`.
   * @param {boolean} args.run    Whether or not the target will be executed.
   * @param {Target}  target      The target information.
   * @param {string}  type        The intended build type: `development` or `production`.
   * @param {boolean} build       Whether or not the target will be build.
   * @return {string}
   */
  getTranspileCommand(args, target, type, build) {
    return build && !target.bundle ?
      this.cliSHTranspileCommand.generate(args) :
      '';
  }
  /**
   * Get the command to run a Node target.
   * @param {Object}  args        The arguments ready to be sent to a `CLICommand` `generate`
   *                              method.
   * @param {string}  args.target The target name.
   * @param {string}  args.type   The intended build type: `development` or `production`.
   * @param {boolean} args.run    Whether or not the target will be executed.
   * @return {string}
   */
  getNodeRunCommand(args) {
    return this.cliSHNodeRunCommand.generate(args);
  }
  /**
   * Get the command to create the revision file, but only if the feature is enabled, otherwise,
   * it will return an empty string.
   * @param {Object}  args        The arguments ready to be sent to a `CLICommand` `generate`
   *                              method.
   * @param {string}  args.target The target name.
   * @param {string}  args.type   The intended build type: `development` or `production`.
   * @param {boolean} args.run    Whether or not the target will be executed.
   * @return {string}
   */
  getRevisionCommand(args) {
    const {
      enabled,
      createRevisionOnBuild,
    } = this.projectConfiguration.version.revision;
    let command = '';
    if (enabled && createRevisionOnBuild.enabled) {
      const revisionEnvCheck = !createRevisionOnBuild.onlyOnProduction ||
        (createRevisionOnBuild.onlyOnProduction && args.type === 'production');
      const revisionTargetCheck = !createRevisionOnBuild.targets.length ||
        createRevisionOnBuild.targets.includes(args.target);

      if (revisionEnvCheck && revisionTargetCheck) {
        command = this.cliRevisionCommand.generate();
      }
    }

    return command;
  }
  /**
   * Get the command to copy the project files, but only if the feature is enabled, otherwise,
   * it will return an empty string.
   * @param {Object}  args        The arguments ready to be sent to a `CLICommand` `generate`
   *                              method.
   * @param {string}  args.target The target name.
   * @param {string}  args.type   The intended build type: `development` or `production`.
   * @param {boolean} args.run    Whether or not the target will be executed.
   * @return {string}
   */
  getCopyProjectFilesCommand(args) {
    const { enabled, copyOnBuild } = this.projectConfiguration.copy;
    let command = '';
    if (enabled && copyOnBuild.enabled) {
      const copyEnvCheck = !copyOnBuild.onlyOnProduction ||
        (copyOnBuild.onlyOnProduction && args.type === 'production');
      const copyTaretCheck = !copyOnBuild.targets.length ||
        copyOnBuild.targets.includes(args.target);

      if (copyEnvCheck && copyTaretCheck) {
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
