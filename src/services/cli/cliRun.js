const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLIRunCommand extends CLICommand {
  constructor() {
    super();
    this.command = 'run [target]';
    this.description = 'Run a target on a development build type';
  }
}

const cliRunCommand = provider((app) => {
  app.set('cliRunCommand', () => new CLIRunCommand());
});

module.exports = {
  CLIRunCommand,
  cliRunCommand,
};
