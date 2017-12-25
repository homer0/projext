const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLICopyProjectFilesCommand extends CLICommand {
  constructor(buildCopier) {
    super();
    this.buildCopier = buildCopier;

    this.command = 'copy-project-files';
    this.description = 'Copy the required project files into the build directory';
  }

  handle() {
    return this.buildCopier.copyFiles();
  }
}

const cliCopyProjectFilesCommand = provider((app) => {
  app.set('cliCopyProjectFilesCommand', () => new CLICopyProjectFilesCommand(
    app.get('buildCopier')
  ));
});

module.exports = {
  CLICopyProjectFilesCommand,
  cliCopyProjectFilesCommand,
};
