const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This commands allows the user to generate new projext resources by makeing use of _"generators"_,
 * which are subclasses of {@link CLISubCommand}.
 * @extends {CLICommand}
 */
class CLIGenerateCommand extends CLICommand {
  /**
   * Class constructor.
   */
  constructor() {
    super();
    /**
     * A dictionary of the resource generators this command uses. The generators are added by using
     * the `addGenerators` method and they key used to save them is their `resource` property.
     * @type {Object}
     */
    this.generators = {};
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'generate [resource]';
    /**
     * A description of the command for the help interface. Take note that this command also has
     * a `fullDescription` property, but it's generated every time `addGenerators` gets called so
     * the detailed description can include the generators information.
     * @type {string}
     */
    this.description = 'Generate a projext resource. Use the --help flag on this command ' +
      'for more information';
    /**
     * Enable unknown options in order to pick the generator options.
     * @type {Boolean}
     */
    this.allowUnknownOptions = true;
  }
  /**
   * Add the list of generators this command can use. After saving the reference to the services,
   * this method will also update the `fullDescription` property with the generators information.
   * @param {Array} generators A list of {@link CLISubCommand} services.
   */
  addGenerators(generators) {
    // Register the generators on the local property.
    generators.forEach((generator) => {
      this.generators[generator.name] = generator;
    });
    // Set an empty description.
    let descriptionList = '';
    // Loop all the registered generators and add their help information to the description.
    const resources = Object.keys(this.generators);
    const lastResource = resources.length - 1;
    resources.forEach((resource, index) => {
      descriptionList += this.generators[resource].getHelpInformation();
      if (index !== lastResource) {
        descriptionList += '\n\n';
      }
    });
    /**
     * Update the detailed description of the command.
     * @ignore
     */
    this.fullDescription = `Generate a projext resource:\n\n${descriptionList}`;
  }
  /**
   * Handle the execution of the command and triggers the selected generator.
   * @param {?string} resource       The name of the resource that needs to be generated. It needs
   *                                 to match with the a generator key on the `generators`
   *                                 dictionary.
   * @param {Command} command        The executed command (sent by `commander`).
   * @param {Object}  options        The command known options.
   * @param {Object}  unknownOptions A dictionary of received unkown options. this method will
   *                                 parse them and send them to the selected generator.
   * @return {Promise<undefined,Error>}
   */
  handle(resource, command, options, unknownOptions) {
    let result;
    if (!resource || !this.generators[resource]) {
      result = Promise.reject(new Error('Invalid resource type'));
    } else {
      const generator = this.generators[resource];
      const generatorOptions = this._parseGeneratorOptions(generator, unknownOptions);
      result = generator.handle(generatorOptions);
    }

    return result;
  }
  /**
   * This method is called when the command is executed and it takes care of parse and match the
   * received unkown options with the selected generator options, so they can be sent to the
   * generator.
   * @param {CLISubCommand} generator The generator from which options will be matched.
   * @param {Object}        options   A dictionary of unkown options the command received.
   * @return {Object}
   * @ignore
   * @access protected
   */
  _parseGeneratorOptions(generator, options) {
    const generatorOptions = {};
    const parameterRegex = /\[[\w-]+\]/g;
    const headerRegex = /^-(?:-)?/;
    generator.options.forEach((optionName) => {
      const option = generator.optionsByName[optionName];
      if (typeof option.defaultValue !== 'undefined') {
        generatorOptions[optionName] = option.defaultValue;
      }

      const headersStr = option.instruction.replace(parameterRegex, '').trim();
      headersStr
      .split(',')
      .map((header) => header.replace(headerRegex, '').trim())
      .some((header) => {
        let result = false;
        if (typeof options[header] !== 'undefined') {
          generatorOptions[optionName] = options[header];
          result = true;
        }

        return result;
      });
    });

    return generatorOptions;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLIGenerateCommand` as the `cliGenerateCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliGenerateCommand);
 * // Getting access to the service instance
 * const cliGenerateCommand = container.get('cliGenerateCommand');
 * @type {Provider}
 */
const cliGenerateCommand = provider((app) => {
  app.set('cliGenerateCommand', () => new CLIGenerateCommand());
});

module.exports = {
  CLIGenerateCommand,
  cliGenerateCommand,
};
