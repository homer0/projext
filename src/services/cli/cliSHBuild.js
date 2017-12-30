const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHBuildCommand extends CLICommand {
  constructor(
    builder,
    cliCleanCommand,
    cliCopyProjectFilesCommand,
    cliRevisionCommand,
    cliSHCopyCommand,
    cliSHNodeRunCommand,
    cliSHTranspileCommand,
    projectConfiguration,
    targets
  ) {
    super();
    this.builder = builder;
    this.cliCleanCommand = cliCleanCommand;
    this.cliCopyProjectFilesCommand = cliCopyProjectFilesCommand;
    this.cliRevisionCommand = cliRevisionCommand;
    this.cliSHCopyCommand = cliSHCopyCommand;
    this.cliSHNodeRunCommand = cliSHNodeRunCommand;
    this.cliSHTranspileCommand = cliSHTranspileCommand;
    this.projectConfiguration = projectConfiguration;
    this.targets = targets;

    this.command = 'sh-build [target]';
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
    this.hidden = true;
  }

  handle(name, command, options) {
    const { type } = options;
    const target = this.targets.getTarget(name);
    const run = type === 'development' && (target.runOnDevelopment || options.run);
    const commands = target.is.node ?
      this.getCommandsForNodeTarget(target, type, run) :
      this.getCommandsForBrowserTarget(target, type, run);

    const output = commands
    .filter((cmd) => !!cmd)
    .join(';');

    this.output(output);
  }

  getCommandsForNodeTarget(target, type, run) {
    const args = {
      target: target.name,
      type,
      run,
    };

    const build = (
      type === 'production' ||
      target.bundle ||
      target.transpile
    );

    const commands = [
      this.getCleanCommandIfNeeded(args, target, type, build, run),
      this.getBuildCommandIfNeeded(args, target, type, build, run),
      this.getCopyCommand(args, target, type, build, run),
      this.getTranspileCommand(args, target, type, build, run),
    ];

    if (!run) {
      commands.push(...[
        this.getRevisionCommand(args, target, type),
        this.getCopyProjectFilesCommand(args, target, type),
      ]);
    } else if (!target.bundle) {
      commands.push(this.getNodeRunCommand(args, target, type));
    }

    return commands;
  }

  getCommandsForBrowserTarget(target, type, run) {
    const args = {
      target: target.name,
      type,
      run,
    };

    const commands = [
      this.getCleanCommandIfNeeded(args, target, type, true, run),
      this.getBuildCommandIfNeeded(args, target, type, true, run),
    ];

    if (!run) {
      commands.push(...[
        this.getRevisionCommand(args, target, type),
        this.getCopyProjectFilesCommand(args, target, type),
      ]);
    }

    return commands;
  }

  getCleanCommandIfNeeded(args, target, type, build) {
    return build && target.cleanBeforeBuild ?
      this.cliCleanCommand.generate(args) :
      '';
  }

  getBuildCommandIfNeeded(args, target, type, build, run) {
    return this.builder.getTargetBuildCommand(target, type, run);
  }

  getCopyCommand(args, target, type, build) {
    return build && !target.bundle ?
      this.cliSHCopyCommand.generate(args) :
      '';
  }

  getTranspileCommand(args, target, type, build) {
    return build && !target.bundle ?
      this.cliSHTranspileCommand.generate(args) :
      '';
  }

  getNodeRunCommand(args) {
    return this.cliSHNodeRunCommand.generate(args);
  }

  getRevisionCommand(args) {
    const { version: { createRevisionOnBuild } } = this.projectConfiguration;
    let command = '';
    if (createRevisionOnBuild.enabled) {
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

  getCopyProjectFilesCommand(args) {
    const { copyOnBuild } = this.projectConfiguration;
    let command = '';
    if (copyOnBuild.enabled) {
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

const cliSHBuildCommand = provider((app) => {
  app.set('cliSHBuildCommand', () => new CLISHBuildCommand(
    app.get('builder'),
    app.get('cliCleanCommand'),
    app.get('cliCopyProjectFilesCommand'),
    app.get('cliRevisionCommand'),
    app.get('cliSHCopyCommand'),
    app.get('cliSHNodeRunCommand'),
    app.get('cliSHTranspileCommand'),
    app.get('projectConfiguration').getConfig(),
    app.get('targets')
  ));
});

module.exports = {
  CLISHBuildCommand,
  cliSHBuildCommand,
};
