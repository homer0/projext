const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLIBuildCommand extends CLICommand {
  constructor() {
    super();
    this.command = 'build [target]';
    this.description = 'Build a target';
    this.addCommonOptions();
  }
}

const cliBuildCommand = provider((app) => {
  app.set('cliBuildCommand', () => new CLIBuildCommand());
});

module.exports = {
  CLIBuildCommand,
  cliBuildCommand,
};
