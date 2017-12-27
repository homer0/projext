const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHValidateRunCommand extends CLICommand {
  constructor(targets) {
    super();
    this.targets = targets;

    this.command = 'sh-validate-run [target]';
    this.description = 'Validate the arguments before the shell executes the task';
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

  handle(name) {
    return this.targets.getTarget(name);
  }
}

const cliSHValidateRunCommand = provider((app) => {
  app.set('cliSHValidateRunCommand', () => new CLISHValidateRunCommand(
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateRunCommand,
  cliSHValidateRunCommand,
};
