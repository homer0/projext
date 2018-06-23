/**
 * A helper class for creating sub commands for the CLI. A sub command works like a
 * {@link CLICommand} inside a regular {@link CLICommand}.
 * @abstract
 * @version 1.0
 */
class CLISubCommand {
  /**
   * Class constructor.
   * @throws {TypeError} If instantiated directly.
   * @abstract
   */
  constructor() {
    if (new.target === CLISubCommand) {
      throw new TypeError(
        'CLISubCommand is an abstract class, it can\'t be instantiated directly'
      );
    }
    /**
     * The name of the sub command for the help interface.
     * @type {string}
     */
    this.name = '';
    /**
     * A short description for what the generator does.
     * @type {string}
     */
    this.description = '';
    /**
     * A list with the name of the options the generator supports. New options can be added using
     * the `addOption` method.
     * @type {Array}
     */
    this.options = [];
    /**
     * A dictionary of options settings by their option name. New options can be added using
     * the `addOption` method.
     * @type {Object}
     */
    this.optionsByName = {};
  }
  /**
   * Add a new option for the command.
   * @example
   * // To capture an option
   * this.addOption(
   *   'type',
   *   '-t, --type [type]',
   *   'The type of thingy you want to use?',
   * );
   *
   * // As a simple flag
   * this.addOption(
   *   'ready',
   *   '-r, --ready',
   *   'Is it read?',
   *   false
   * );
   *
   * @param {string} name              The option name.
   * @param {string} instruction       The option instruction, for example: `-t, --type [type]`.
   * @param {string} [description='']  The option description.
   * @param {string} [defaultValue=''] The option default value, in case is not used on execution.
   */
  addOption(name, instruction, description = '', defaultValue = '') {
    this.optionsByName[name] = {
      name,
      instruction,
      description,
      defaultValue,
    };

    this.options.push(name);
  }
  /**
   * Generates a complete description of the sub command and its options in order to be used on the
   * help interface of the {@link CLICommand} that implements it.
   * @return {string}
   */
  getHelpInformation() {
    // Define the basic description line.
    let description = ` - '${this.name}': ${this.description}`;
    // If the generator has options...
    if (this.options.length) {
      // ...add the options subtitle.
      description += '\n   Options:\n';
      /**
       * Loop all the options and find the one with the longest instruction to calculate the
       * necessary padding in order to show all instructions on a _"fixed width column"_ style.
       */
      let longest = '';
      this.options.forEach((optionName) => {
        const option = this.optionsByName[optionName];
        if (option.instruction.length > longest.length) {
          longest = option.instruction;
        }
      });
      // Once the longest instruction is saved, loop all the options again...
      this.options.forEach((optionName) => {
        const option = this.optionsByName[optionName];
        // Set the instruction as the initial value of the description.
        let line = option.instruction;
        // If the instruction is shorter than the longest, add the necessary padding.
        if (line.length < longest.length) {
          line += (new Array(longest.length - line.length)).fill(' ').join('');
        }
        // Add the option description after the instruction, and possibly the padding.
        line += `  ${option.description}`;
        // Add the description to the generator description.
        description += `\n   ${line}`;
      });
    }

    return description;
  }
  /**
   * The method called by the {@link CLICommand} that implements the sub command.
   * It receives a dicitionary with the parsed options the command received.
   * @throws {Error} if not overwritten.
   * @abstract
   */
  handle() {
    throw new Error('This method must to be overwritten');
  }
}

module.exports = CLISubCommand;
