const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLIRevisionCommand extends CLICommand {
  constructor(projectConfiguration, versionUtils) {
    super();
    this.projectConfiguration = projectConfiguration;
    this.versionUtils = versionUtils;

    this.command = 'create-revision';
    this.description = 'Create the revision file with the project version';
  }

  handle() {
    const { version: { revision } } = this.projectConfiguration;
    if (!revision.enabled) {
      throw new Error('The revision feature is disabled on the project configuration');
    }

    return this.versionUtils.createRevisionFile(revision.filename);
  }
}

const cliRevisionCommand = provider((app) => {
  app.set('cliRevisionCommand', () => new CLIRevisionCommand(
    app.get('projectConfiguration').getConfig(),
    app.get('versionUtils')
  ));
});

module.exports = {
  CLIRevisionCommand,
  cliRevisionCommand,
};
