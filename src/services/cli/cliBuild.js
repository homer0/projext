const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLIBuildCommand extends CLICommand {
  constructor() {
    super();
    this.command = 'build [target]';
    this.description = 'Build a target';
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
  }
}

const cliBuildCommand = provider((app) => {
  app.set('cliBuildCommand', () => new CLIBuildCommand());
});

module.exports = {
  CLIBuildCommand,
  cliBuildCommand,
};
