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
    return this.versionUtils.createRevisionFile(
      this.projectConfiguration.version.revisionFilename
    );
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
