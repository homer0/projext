const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHBuildCommand extends CLICommand {
  constructor(
    builder,
    cliCopyProjectFilesCommand,
    cliRevisionCommand,
    cliSHCopyCommand,
    cliSHTranspileCommand,
    projectConfiguration
  ) {
    super();
    this.builder = builder;
    this.cliCopyProjectFilesCommand = cliCopyProjectFilesCommand;
    this.cliRevisionCommand = cliRevisionCommand;
    this.cliSHCopyCommand = cliSHCopyCommand;
    this.cliSHTranspileCommand = cliSHTranspileCommand;
    this.projectConfiguration = projectConfiguration;

    this.command = 'sh-build [target]';
    this.description = 'Get the build commands for the shell program to execute';
    this.addCommonOptions();
    this.hidden = true;
  }

  handle(target, command, options) {
    const { type } = options;
    const commands = [];
    const buildCommand = this.builder.getTargetBuildCommand(target, type);
    if (buildCommand) {
      commands.push(buildCommand);
    }

    const args = { target, type };
    const deps = [
      this.cliSHCopyCommand.generate(args),
      this.cliSHTranspileCommand.generate(args),
    ];

    const {
      copyOnBuild,
      version: {
        createRevisionOnBuild,
      },
    } = this.projectConfiguration;

    if (createRevisionOnBuild.enabled) {
      const revisionTargetCheck = !createRevisionOnBuild.targets.length ||
        createRevisionOnBuild.targets.includes(target);

      if (revisionTargetCheck) {
        deps.push(this.cliRevisionCommand.generate());
      }
    }

    if (copyOnBuild.enabled) {
      const copyEnvCheck = !copyOnBuild.onlyOnProduction ||
        (copyOnBuild.onlyOnProduction && type === 'production');
      const copyTaretCheck = !copyOnBuild.targets.length ||
        copyOnBuild.targets.includes(target);

      if (copyEnvCheck && copyTaretCheck) {
        deps.push(this.cliCopyProjectFilesCommand.generate());
      }
    }

    commands.push(...deps.map((cmd) => `${this.cliName} ${cmd}`));

    this.output(commands.join(';'));
  }
}

const cliSHBuildCommand = provider((app) => {
  app.set('cliSHBuildCommand', () => new CLISHBuildCommand(
    app.get('builder'),
    app.get('cliCopyProjectFilesCommand'),
    app.get('cliRevisionCommand'),
    app.get('cliSHCopyCommand'),
    app.get('cliSHTranspileCommand'),
    app.get('projectConfiguration').getConfig()
  ));
});

module.exports = {
  CLISHBuildCommand,
  cliSHBuildCommand,
};
