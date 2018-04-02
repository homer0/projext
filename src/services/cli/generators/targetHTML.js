const path = require('path');
const fs = require('fs-extra');
const { provider } = require('jimple');
const CLISubCommand = require('../../../abstracts/cliSubCommand');
/**
 * This is a CLI generator that allows the user to create an HTML file for a browser target.
 * What it does is to force projext to create the default HTML file it would create if the target
 * didn't have one and then it moves it to the target directory.
 * @extends {CLISubCommand}
 */
class TargetHTMLGenerator extends CLISubCommand {
  /**
   * Class constructor.
   * @param {Logger}      appLogger   To inform the user when the file has been generated, or if
   *                                  something went wrong.
   * @param {Prompt}      appPrompt   To ask the user for the arget name and the file path.
   * @param {Targets}     targets     To get the selected target information.
   * @param {TargetsHTML} targetsHTML To generate the HTML file.
   */
  constructor(appLogger, appPrompt, targets, targetsHTML) {
    super();
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
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
    /**
     * A local reference for the `targetsHTML` service.
     * @type {TargetsHTML}
     */
    this.targetsHTML = targetsHTML;
    /**
     * The resource type the user will have to select on the CLI command that manages the
     * generator.
     * @type {string}
     */
    this.name = 'html';
    /**
     * A short description of what the generator does.
     * @type {string}
     */
    this.description = 'Generate a browser target HTML template';
  }
  /**
   * This method first prompts the user for information about the target and the file that is
   * going to create, then uses the {@link TargetsHTML} to create a _"default HTML file"_, and it
   * finally moves it to the selected path.
   * @return {Promise<undefined,Error>}
   */
  handle() {
    // Get the _"default browser target"_.
    const defaultTarget = this.targets.getDefaultTarget('browser');
    // Define the prompt schema.
    const schema = {
      target: {
        default: defaultTarget.name,
        description: 'Target',
        message: 'It should be the name of valid browser target',
        required: true,
        // Validate that the selected target exists and its type is `browser`.
        conform: (value) => (
          this.targets.targetExists(value) &&
          this.targets.getTarget(value).is.browser
        ),
      },
      filename: {
        default: defaultTarget.html.template,
        // Validate the name of the HTML file.
        pattern: /^[a-zA-Z0-9\.-_]+\.html$/i,
        description: 'Filename',
        message: 'It should be a valid name for an HTML file',
        required: true,
      },
      overwrite: {
        type: 'boolean',
        default: 'yes',
        description: 'Overwrite existing file',
        required: true,
        // Only ask for an overwrite confirmation if the file already exists.
        ask: () => {
          const target = this.targets.getTarget(this.appPrompt.getValue('target'));
          const filename = this.appPrompt.getValue('filename');
          return fs.pathExistsSync(path.join(target.paths.source, filename));
        },
      },
    };

    let filepath;
    let moving = false;
    // Ask the user...
    return this.appPrompt.ask(schema)
    .then((results) => {
      // Get the selected target information.
      const target = this.targets.getTarget(results.target);
      // Build the HTML file absolute path.
      filepath = path.join(target.paths.source, results.filename);
      // Check if the file already exists.
      const exists = fs.pathExistsSync(filepath);
      let nextStep;
      // If the file doesn't exist or if it exists but the user choose to overwrite it...
      if (!exists || (exists && results.overwrite)) {
        // Generate it on the temp directory.
        const tempPath = this.targetsHTML.getFilepath(target, true);
        moving = true;
        // Move the HTML file from the temp directory to the selected path.
        nextStep = fs.move(tempPath, filepath);
      }

      return nextStep;
    })
    .then(() => {
      // If the file was successfully moved, inform the user.
      if (moving) {
        this.appLogger.success(`The HTML file was successfully generated: ${filepath}`);
      }
    })
    .catch((error) => {
      let result;
      // If the process failed and it wasn't because the user canceled the input...
      if (error.message !== 'canceled') {
        // ...show the error.
        this.appLogger.error('There was an error while generating the HTML file');
        result = Promise.reject(error);
      }

      return result;
    });
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `TargetHTMLGenerator` as the `targetHTMLGenerator` service.
 * @example
 * // Register it on the container
 * container.register(targetHTMLGenerator);
 * // Getting access to the service instance
 * const targetHTMLGenerator = container.get('targetHTMLGenerator');
 * @type {Provider}
 */
const targetHTMLGenerator = provider((app) => {
  app.set('targetHTMLGenerator', () => new TargetHTMLGenerator(
    app.get('appLogger'),
    app.get('appPrompt'),
    app.get('targets'),
    app.get('targetsHTML')
  ));
});

module.exports = {
  TargetHTMLGenerator,
  targetHTMLGenerator,
};
