const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHCopyCommand extends CLICommand {
  constructor(builder) {
    super();
    this.builder = builder;

    this.command = 'sh-copy-target [target]';
    this.description = 'Copy a target files, only if the target requires' +
      'transpilation or the `type` argument is production';
    this.addOption(
      'type',
      '-t, --type [type]',
      'Which build type: development (default) or production',
      'development'
    );
    this.hidden = true;
  }

  handle(target, command, options) {
    return this.builder.copyTarget(target, options.type);
  }
}

const cliSHCopyCommand = provider((app) => {
  app.set('cliSHCopyCommand', () => new CLISHCopyCommand(app.get('builder')));
});

module.exports = {
  CLISHCopyCommand,
  cliSHCopyCommand,
};
