const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHRunCommand extends CLICommand {
  constructor(cliBuildCommand) {
    super();
    this.cliBuildCommand = cliBuildCommand;

    this.command = 'sh-run [target]';
    this.description = 'Get the build commands for the shell program to execute';
    this.hidden = true;
  }

  handle(target) {
    this.output(this.cliBuildCommand.generate({
      target,
      type: 'development',
      run: true,
    }));
  }
}

const cliSHRunCommand = provider((app) => {
  app.set('cliSHRunCommand', () => new CLISHRunCommand(
    app.get('cliBuildCommand')
  ));
});

module.exports = {
  CLISHRunCommand,
  cliSHRunCommand,
};
