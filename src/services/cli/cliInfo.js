const util = require('util');
const ObjectUtils = require('wootils/shared/objectUtils');
const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the command used on the CLI to show the contents of the project configuration.
 * @extends {CLICommand}
 */
class CLIInfoCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Logger}                       appLogger            To log the configuration on the
   *                                                            console.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the configuration.
   */
  constructor(appLogger, projectConfiguration) {
    super();
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * All the project settings.
     * @type {ProjectConfigurationSettings}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'info [path]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Show the contents of the project configuration. ' +
      'You can use a directory-like (/) path to see specific settings';
  }
  /**
   * Handle the execution of the command and shows the project configuration.
   * @param {?string} path The path to specific settings.
   */
  handle(path) {
    let title;
    let settings;
    // If a path has been specified...
    if (path) {
      // ...use the `utils` service to get the settings on that path.
      title = `Showing '${path}'`;
      settings = ObjectUtils.get(this.projectConfiguration, path, '/', true);
    } else {
      // ...otherwise, show everything.
      title = 'Showing all the project settings';
      settings = this.projectConfiguration;
    }
    // Inform the user of what's going to be shown.
    this.appLogger.success(title);
    // Log the selected settings.
    this.output(util.inspect(settings, {
      colors: true,
      depth: 7,
    }));
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLIInfoCommand` as the `cliInfoCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliInfoCommand);
 * // Getting access to the service instance
 * const cliInfoCommand = container.get('cliInfoCommand');
 * @type {Provider}
 */
const cliInfoCommand = provider((app) => {
  app.set('cliInfoCommand', () => new CLIInfoCommand(
    app.get('appLogger'),
    app.get('projectConfiguration').getConfig()
  ));
});

module.exports = {
  CLIInfoCommand,
  cliInfoCommand,
};
