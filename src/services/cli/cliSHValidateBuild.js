const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHValidateBuildCommand extends CLICommand {
  constructor(appLogger, targets) {
    super();
    this.appLogger = appLogger;
    this.targets = targets;

    this.command = 'sh-validate-build [target]';
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

  handle(name, command, options) {
    const { run, type } = options;
    const target = this.targets.getTarget(name);

    if (
      target.is.node &&
      type === 'development' &&
      (run || target.runOnDevelopment) &&
      !target.bundle &&
      !target.transpile
    ) {
      this.appLogger.warning(
        `The target '${name}' doesn't need bundling nor transpilation, ` +
        'so there\'s no need to build it'
      );
    }
  }
}

const cliSHValidateBuildCommand = provider((app) => {
  app.set('cliSHValidateBuildCommand', () => new CLISHValidateBuildCommand(
    app.get('appLogger'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateBuildCommand,
  cliSHValidateBuildCommand,
};
