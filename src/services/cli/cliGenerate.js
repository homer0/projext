const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is the command that allows you to generate new projext resource. It implements other
 * _"generators services"_ to show information about what can be created and when executed, it
 * leaves the actual _"resource generation"_ to those services.
 * @extends {CLICommand}
 */
class CLIGenerateCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {ProjectConfigurationFileGenerator} projectConfigurationFileGenerator
   * The service that generates a projext configuration file.
   * @param {TargetHTMLGenerator} targetHTMLGenerator
   * The service that generates HTML files for browser targets.
   */
  constructor(
    projectConfigurationFileGenerator,
    targetHTMLGenerator
  ) {
    super();
    /**
     * A dictionary of the resource generators this command uses. The keys are the resource types.
     * @type {Object}
     * @property {ProjectConfigurationFileGenerator} config The generator that creates a project
     *                                                      configuration file.
     * @property {TargetHTMLGenerator}               html   The generator that creates a browser
     *                                                      target HTML file.
     */
    this.generators = {
      config: projectConfigurationFileGenerator,
      html: targetHTMLGenerator,
    };
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'generate [resource]';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = 'Generate a projext resource. Use the --help flag on this command ' +
      'for more information';

    const generatorsList = Object.keys(this.generators)
    .map((name) => `\n - '${name}': ${this.generators[name].description}`);
    /**
     * A more complete description that will show up on the command help interface. It includes
     * the list of generators and their descriptions.
     * @type {string}
     */
    this.fullDescription = `Generate a projext resource:${generatorsList}`;
  }
  /**
   * Handle the execution of the command and triggers the right generator.
   * @param {?string} resource The name of the resource that needs to be generated. It needs to
   *                           match with the a generator key on the `generators` dictionary.
   * @return {Promise<undefined,Error>}
   * @throws {Error} If a resource is not specified or if the resource doesn't have a generator
   *                 for it.
   */
  handle(resource) {
    if (!resource || !this.generators[resource]) {
      throw new Error('Invalid resource type');
    }

    const generator = this.generators[resource];
    return generator.generate();
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
  app.set('cliGenerateCommand', () => new CLIGenerateCommand(
    app.get('projectConfigurationFileGenerator'),
    app.get('targetHTMLGenerator')
  ));
});

module.exports = {
  CLIGenerateCommand,
  cliGenerateCommand,
};
