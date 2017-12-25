const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHBuildCommand extends CLICommand {
  constructor(
    builder,
    cliSHCopyCommand,
    cliSHTranspileCommand
  ) {
    super();
    this.builder = builder;
    this.cliSHCopyCommand = cliSHCopyCommand;
    this.cliSHTranspileCommand = cliSHTranspileCommand;

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
    ]
    .map((cmd) => `${this.cliName} ${cmd}`);
    commands.push(...deps);

    this.output(commands.join(';'));
  }
}

const cliSHBuildCommand = provider((app) => {
  app.set('cliSHBuildCommand', () => new CLISHBuildCommand(
    app.get('builder'),
    app.get('cliSHCopyCommand'),
    app.get('cliSHTranspileCommand')
  ));
});

module.exports = {
  CLISHBuildCommand,
  cliSHBuildCommand,
};
