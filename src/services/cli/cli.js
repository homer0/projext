const commander = require('commander');
const { provider } = require('jimple');
/**
 * The main CLI program interface where all the commands are registered and that works as a bridge
 * between the app and `commander`.
 */
class CLI {
  /**
   * Class constructor.
   * @param {Object} info      This app `package.json` information.
   * @param {string} [name=''] The name of the program. If not specified, it will use the one on
   *                           `info` object.
   */
  constructor(info, name = '') {
    /**
     * This app `package.json` information.
     * @type {Object}
     */
    this.info = info;
    /**
     * The name of the CLI program.
     * @type {string}
     */
    this.name = name || this.info.name;
  }
  /**
   * Start the interface with a list of commands.
   * @param {Array<CLICommand>} commands A list of commands to register.
   */
  start(commands) {
    // eslint-disable-next-line no-underscore-dangle
    commander._name = this.name;
    // Set the version and the description of the program.
    commander.version(this.info.version, '-v, --version');
    commander.description(this.info.description);
    // Loop all the commands and register them.
    commands.forEach((command) => {
      command.register(commander, this);
    });
    // Tell commander to parse the arguments.
    commander.parse(process.argv);
  }
}
/**
 * Generates a `Provider` with an already defined name for the program.
 * @example
 * // Generate the provider
 * const provider = cliWithName('my-program');
 * // Register it on the container
 * container.register(provider);
 * // Getting access to the service instance
 * const cli = container.get('cli');
 * @param {string} name The name of the program.
 * @return {Provider}
 */
const cliWithName = (name) => provider((app) => {
  app.set('cli', () => new CLI(
    app.get('info'),
    name
  ));
});
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLI` as the `cli` service.
 * @example
 * // Register it on the container
 * container.register(cli);
 * // Getting access to the service instance
 * const cli = container.get('cli');
 * @type {Provider}
 */
const cli = cliWithName();

module.exports = {
  CLI,
  cliWithName,
  cli,
};
