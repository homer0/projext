const Jimple = require('jimple');
const appPackage = require('../../package.json');

const {
  environmentUtils,
  errorHandler,
  appLogger,
  packageInfo,
  pathUtils,
  rootRequire,
} = require('wootils/node/providers');

const {
  babelHelper,
  cleaner,
  copier,
  events,
  plugins,
  appPrompt,
  tempFiles,
  utils,
  versionUtils,
} = require('../services/common');

const {
  buildCleaner,
  buildCopier,
  buildEngines,
  buildNodeRunner,
  buildNodeRunnerProcess,
  buildTranspiler,
  buildVersion,
  builder,
} = require('../services/building');

const {
  cli,
  cliBuildCommand,
  cliCleanCommand,
  cliCopyProjectFilesCommand,
  cliGenerateCommand,
  cliInfoCommand,
  cliRevisionCommand,
  cliRunCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHNodeRunCommand,
  cliSHRunCommand,
  cliSHTranspileCommand,
  cliSHValidateBuildCommand,
  cliSHValidateRunCommand,
  cliGenerators,
} = require('../services/cli');

const {
  babelConfiguration,
  projectConfiguration,
  targetConfiguration,
} = require('../services/configurations');

const {
  targets,
  targetsFinder,
  targetsHTML,
} = require('../services/targets');
/**
 * This is projext dependecy injection container. This class is in charge of registering all the
 * known services, load any existing plugin and add an error handler.
 * @extends {Jimple}
 */
class Projext extends Jimple {
  /**
   * Registers all the known services, load any existing plugin and add an error handler.
   * @ignore
   */
  constructor() {
    super();

    this.set('info', () => appPackage);

    this.register(environmentUtils);
    this.register(errorHandler);
    this.register(appLogger);
    this.register(packageInfo);
    this.register(pathUtils);
    this.register(rootRequire);

    this.register(babelHelper);
    this.register(cleaner);
    this.register(copier);
    this.register(events);
    this.register(plugins('projext-plugin-'));
    this.register(appPrompt);
    this.register(tempFiles);
    this.register(utils);
    this.register(versionUtils);

    this.register(buildCleaner);
    this.register(buildCopier);
    this.register(buildEngines);
    this.register(buildNodeRunner);
    this.register(buildNodeRunnerProcess);
    this.register(buildTranspiler);
    this.register(buildVersion);
    this.register(builder);

    this.register(cli);
    this.register(cliBuildCommand);
    this.register(cliCleanCommand);
    this.register(cliCopyProjectFilesCommand);
    this.register(cliGenerateCommand);
    this.register(cliInfoCommand);
    this.register(cliRevisionCommand);
    this.register(cliRunCommand);
    this.register(cliSHBuildCommand);
    this.register(cliSHCopyCommand);
    this.register(cliSHNodeRunCommand);
    this.register(cliSHRunCommand);
    this.register(cliSHTranspileCommand);
    this.register(cliSHValidateBuildCommand);
    this.register(cliSHValidateRunCommand);
    this.register(cliGenerators.targetHTMLGenerator);
    this.register(cliGenerators.projectConfigurationFileGenerator);

    this.register(babelConfiguration);
    this.register(projectConfiguration);
    this.register(targetConfiguration);

    this.register(targets);
    this.register(targetsFinder);
    this.register(targetsHTML);

    this._loadPlugins();
    this._addErrorHandler();
  }
  /**
   * Starts projext CLI interface.
   */
  cli() {
    // Get the `generate` command and register the available generators.
    const generateCommand = this.get('cliGenerateCommand');
    generateCommand.addGenerators([
      this.get('projectConfigurationFileGenerator'),
      this.get('targetHTMLGenerator'),
    ]);
    // Start the CLI with the available commands.
    this.get('cli').start([
      this.get('cliBuildCommand'),
      this.get('cliRunCommand'),
      this.get('cliCleanCommand'),
      this.get('cliCopyProjectFilesCommand'),
      generateCommand,
      this.get('cliInfoCommand'),
      this.get('cliRevisionCommand'),
      this.get('cliSHBuildCommand'),
      this.get('cliSHCopyCommand'),
      this.get('cliSHNodeRunCommand'),
      this.get('cliSHRunCommand'),
      this.get('cliSHTranspileCommand'),
      this.get('cliSHValidateBuildCommand'),
      this.get('cliSHValidateRunCommand'),
    ]);
  }
  /**
   * Uses the `plugins` service to load and register any existing plugin.
   * @ignore
   * @access protected
   */
  _loadPlugins() {
    this.get('plugins').load();
  }
  /**
   * Makes the `errorHandler` service listen for any uncaught exceptions projext may throw.
   * @ignore
   * @access protected
   */
  _addErrorHandler() {
    this.get('errorHandler').listen();
  }
}

module.exports = { Projext };
