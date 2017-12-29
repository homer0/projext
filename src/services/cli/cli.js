const commander = require('commander');
const { provider } = require('jimple');

class CLI {
  constructor(info, name = '') {
    this.info = info;

    this.name = name || this.info.name;
  }

  start(commands) {
    // eslint-disable-next-line no-underscore-dangle
    commander._name = this.name;
    commander.version(this.info.version, '-v, --version');
    commander.description(this.info.description);

    commands.forEach((command) => {
      command.register(commander, this);
    });

    commander.parse(process.argv);
  }
}

const cliWithName = (name) => provider((app) => {
  app.set('cli', () => new CLI(
    app.get('info'),
    name
  ));
});

const cli = cliWithName();

module.exports = {
  CLI,
  cliWithName,
  cli,
};
