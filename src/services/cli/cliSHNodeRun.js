const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHNodeRunCommand extends CLICommand {
  constructor(buildNodeRunner, targets) {
    super();
    this.buildNodeRunner = buildNodeRunner;
    this.targets = targets;

    this.command = 'sh-node-run [target]';
    this.description = 'Run a Node target that wasn\'t bundled';
    this.hidden = true;
  }

  handle(name) {
    const target = this.targets.getTarget(name);
    return this.buildNodeRunner.runTarget(target);
  }
}

const cliSHNodeRunCommand = provider((app) => {
  app.set('cliSHNodeRunCommand', () => new CLISHNodeRunCommand(
    app.get('buildNodeRunner'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHNodeRunCommand,
  cliSHNodeRunCommand,
};
