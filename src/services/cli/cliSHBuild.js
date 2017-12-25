const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHBuildCommand extends CLICommand {
  constructor(
    builder,
    cliCleanCommand,
    cliCopyProjectFilesCommand,
    cliRevisionCommand,
    cliSHCopyCommand,
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
    this.cliSHTranspileCommand = cliSHTranspileCommand;
    this.projectConfiguration = projectConfiguration;
    this.targets = targets;

    this.command = 'sh-build [target]';
    this.description = 'Get the build commands for the shell program to execute';
    this.addCommonOptions();
    this.hidden = true;
  }

  handle(target, command, options) {
    const { type } = options;
    const args = { target, type };
    const commands = [
      this.getCleanCommandIfNeeded(args),
      this.getBuildCommandIfNeeded(args),
      this.getCopyCommand(args),
      this.getTranspileCommand(args),
      this.getRevisionCommand(args),
      this.getCopyProjectFilesCommand(args),
    ]
    .filter((cmd) => !!cmd);

    this.output(commands.join(';'));
  }

  getCleanCommandIfNeeded(args) {
    const target = this.targets.getTarget(args.target);
    return target.cleanBeforeBuild ?
      this.cliCleanCommand.generate(args) :
      '';
  }

  getBuildCommandIfNeeded(args) {
    return this.builder.getTargetBuildCommand(args.target, args.type);
  }

  getCopyCommand(args) {
    return this.cliSHCopyCommand.generate(args);
  }

  getTranspileCommand(args) {
    return this.cliSHTranspileCommand.generate(args);
  }

  getRevisionCommand(args) {
    const { version: { createRevisionOnBuild } } = this.projectConfiguration;
    let command = '';
    if (createRevisionOnBuild.enabled) {
      const revisionTargetCheck = !createRevisionOnBuild.targets.length ||
        createRevisionOnBuild.targets.includes(args.target);

      if (revisionTargetCheck) {
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
    app.get('cliSHTranspileCommand'),
    app.get('projectConfiguration').getConfig(),
    app.get('targets')
  ));
});

module.exports = {
  CLISHBuildCommand,
  cliSHBuildCommand,
};
