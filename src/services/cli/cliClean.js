const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLICleanCommand extends CLICommand {
  constructor(builder, buildCleaner) {
    super();

    this.builder = builder;
    this.buildCleaner = buildCleaner;

    this.command = 'clean [target]';
    this.description = 'Delete builded files for a target. If no target is ' +
      'specified, the build directory will be deleted';
  }

  handle(target) {
    return target ?
      this.builder.cleanTarget(target) :
      this.buildCleaner.cleanAll();
  }
}

const cliCleanCommand = provider((app) => {
  app.set('cliCleanCommand', () => new CLICleanCommand(
    app.get('builder'),
    app.get('buildCleaner')
  ));
});

module.exports = {
  CLICleanCommand,
  cliCleanCommand,
};
