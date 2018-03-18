const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * This service allows you to generate a configuration file with all the information projext
 * assumes about your project.
 * @todo This should support picking specific keys so it won't write EVERYTHING.
 */
class ProjectConfigurationFileGenerator {
  /**
   * Class constructor.
   * @param {Logger}                       appLogger            To inform the user when the file
   *                                                            has been generated or if something
   *                                                            went wrong.
   * @param {Prompt}                       appPrompt            To ask the user the path to the
   *                                                            file.
   * @param {PathUtils}                    pathUtils            To build the absolute path for the
   *                                                            file.
   * @param {ProjectConfigurationSettings} projectConfiguration To get all the settings that are
   *                                                            going to go on the file.
   * @param {Utils}                        utils                To format some of the options
   *                                                            into human readable descriptions.
   */
  constructor(appLogger, appPrompt, pathUtils, projectConfiguration, utils) {
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `appPrompt` service.
     * @type {Prompt}
     */
    this.appPrompt = appPrompt;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * All the project settings.
     * @type {ProjectConfigurationSettings}
     */
    this.projectConfiguration = projectConfiguration;
    /**
     * A local reference for the `utils` service.
     * @type {Utils}
     */
    this.utils = utils;
    /**
     * A small description of what the generator does.
     * @type {string}
     */
    this.description = 'Generate a configuration based on what projext knows of your project';
    /**
     * A list with the names the configuration file can have and that projext supports.
     * @type {Array}
     * @ignore
     * @access protected
     */
    this._nameOptions = [
      'projext.config.js',
      'config/projext.config.js',
      'config/project.config.js',
    ];
  }
  /**
   * This method first prompts the user for information about the file and then writes it.
   * It asks for one of the supported filenames for projext configurations, if the file already
   * exists it asks for an overwrite confirmation.
   * @return {Promise<undefined,Error>}
   */
  generate() {
    // Get the first name option to use as default.
    const [firstNameOption] = this._nameOptions;
    /**
     * Format the list so it can be added as an erro message in case the user selects an invalid
     * name.
     */
    const nameOptionsStr = this.utils.humanReadableList(
      this._nameOptions.map((option) => `'${option}'`)
    );
    // Define the prompt schema.
    const schema = {
      filename: {
        default: firstNameOption,
        description: 'Filename',
        message: `It can only be one of these: ${nameOptionsStr}`,
        required: true,
        // Validate that the selected name is supported by projext.
        conform: (value) => this._nameOptions.includes(value.toLowerCase()),
        // Always save the selected name on lower case.
        before: (value) => value.toLowerCase(),
      },
      overwrite: {
        type: 'boolean',
        default: 'yes',
        description: 'Overwrite existing file',
        required: true,
        // Only ask for an overwrite confirmation if the file already exists.
        ask: () => {
          const filename = this.appPrompt.getValue('filename');
          return fs.pathExistsSync(this.pathUtils.join(filename));
        },
      },
    };

    let filepath;
    let creating = false;
    // Ask the user...
    return this.appPrompt.ask(schema)
    .then((results) => {
      // Build the path to the file.
      filepath = this.pathUtils.join(results.filename);
      // Check if the file already exists.
      const exists = fs.pathExistsSync(filepath);
      let nextStep;
      // If the file doesn't exists or if it exists but the user choose to overwrite it...
      if (!exists || (exists && results.overwrite)) {
        creating = true;
        // ...write the file.
        nextStep = this._writeFile(filepath);
      }

      return nextStep;
    })
    .then(() => {
      // If the file was created, inform the user.
      if (creating) {
        this.appLogger.success(`The configuration file was successfully generted: ${filepath}`);
      }
    })
    .catch((error) => {
      let result;
      // If the process failed and it wasn't because the user canceled the input...
      if (error.message !== 'canceled') {
        // ...show the error.
        this.appLogger.error('There was an error while generating the configuration file');
        result = Promise.reject(error);
      }

      return result;
    });
  }
  /**
   * Reads the project configuration and writes it on a specified file. It also takes care of
   * formatting it into a valid JS object.
   * @param {string} filepath The path to the file where the configuration should be written.
   * @return {Promise<undefined,Error>}
   * @private
   * @access protected
   */
  _writeFile(filepath) {
    // Convert the configuration into a string with proper indentation.
    const json = JSON.stringify(this.projectConfiguration, undefined, 2)
    // Escape single quotes.
    .replace(/'/g, '\\\'')
    // Replace double quotes with single quotes.
    .replace(/"/g, '\'')
    // Remove single quotes from keys.
    .replace(/^(\s+)?(')(\w+)('): /mg, '$1$3: ')
    /**
     * Add trailing commas. The reason the regex is executed twice is because matches can't
     * intersect other matches, and since the regex uses a closing symbol as delimiter, that same
     * delimiter can't be fixed unless we run the regex again.
     */
    .replace(/([\]|}|\w|'])(\n(?:\s+)?[}|\]])/g, '$1,$2')
    .replace(/([\]|}])(\n(?:\s+)?[}|\]])/g, '$1,$2');

    const template = `module.exports = ${json};\n`;

    return fs.writeFile(filepath, template);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `ProjectConfigurationFileGenerator` as the `projectConfigurationFileGenerator` service.
 * @example
 * // Register it on the container
 * container.register(projectConfigurationFileGenerator);
 * // Getting access to the service instance
 * const projectConfigurationFileGenerator = container.get('projectConfigurationFileGenerator');
 * @type {Provider}
 */
const projectConfigurationFileGenerator = provider((app) => {
  app.set('projectConfigurationFileGenerator', () => new ProjectConfigurationFileGenerator(
    app.get('appLogger'),
    app.get('appPrompt'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('utils')
  ));
});

module.exports = {
  ProjectConfigurationFileGenerator,
  projectConfigurationFileGenerator,
};
