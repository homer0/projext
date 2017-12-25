const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHTranspileCommand extends CLICommand {
  constructor(builder) {
    super();
    this.builder = builder;

    this.command = 'sh-transpile-target [target]';
    this.description = 'Transpile a target code if needed';
    this.addCommonOptions();
    this.hidden = true;
  }

  handle(target, command, options) {
    return this.builder.transpileTarget(target, options.type);
  }
}

const cliSHTranspileCommand = provider((app) => {
  app.set('cliSHTranspileCommand', () => new CLISHTranspileCommand(app.get('builder')));
});

module.exports = {
  CLISHTranspileCommand,
  cliSHTranspileCommand,
};
