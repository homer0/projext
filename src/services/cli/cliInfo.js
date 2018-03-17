const util = require('util');
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
   * Handle the execution of the command and shows the project configuration..
   * @param {?string} path The path to specific settings.
   */
  handle(path) {
    let title;
    let settings;
    if (path) {
      title = `Showing '${path}'`;
      const parts = path.split('/');
      const first = parts.shift();
      let currentSetting = this.projectConfiguration[first];
      if (typeof currentSetting === 'undefined') {
        throw new Error(`There are no settings on the path '${path}'`);
      } else if (parts.length) {
        let currentPath = first;
        for (let i = 0; i < parts.length; i++) {
          const currentPart = parts[i];
          currentPath += `/${currentPart}`;
          currentSetting = currentSetting[currentPart];
          if (typeof currentSetting === 'undefined') {
            throw new Error(`There are no settings on the path '${currentPath}'`);
          }
        }
      }

      settings = currentSetting;
    } else {
      title = 'Showing all the project settings';
      settings = this.projectConfiguration;
    }

    this.appLogger.success(title);
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
