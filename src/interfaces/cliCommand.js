/**
 * A helper class for creating commands for the CLI interface.
 * @interface
 */
class CLICommand {
  /**
   * Class constructor.
   * @throws {TypeError} If instantiated directly.
   */
  constructor() {
    if (new.target === CLICommand) {
      throw new TypeError(
        'CLICommand is an abstract class, it can\'t be instantiated directly'
      );
    }
    /**
     * The CLI command instruction. For example `my-command [target]`.
     * @type {String}
     */
    this.command = '';
    /**
     * A description of the command for the help interface.
     * @type {String}
     */
    this.description = '';
    /**
     * A list with the name of the options the command supports. New options can be added using
     * the `addOption` method.
     * @type {Array}
     */
    this.options = [];
    /**
     * A dictionary of command options settings by their option name. New options can be added
     * using the `addOption` method.
     * @type {Object}
     */
    this.optionsByName = {};
    /**
     * This is a useful flag for when the command is ran as a result of another command. It lets
     * the interface know that it can search for option values on a parent command, if there's one.
     * @type {Boolean}
     */
    this.checkOptionsOnParent = true;
    /**
     * Whether the command and its description should be shown on the CLI interface list of
     * commands.
     * @type {Boolean}
     */
    this.hidden = false;
    /**
     * Whether or not a sub program should be executed for this command. Take for example the case
     * of `git`, where `git checkout [branch]` executes `git` as main program, and `checkout` as a
     * sub program. If this is `true`, then a binary with the name of the command should be
     * exported on the `package.json`.
     * @type {Boolean}
     */
    this.subProgram = false;
    /**
     * This is the name of the program that runs the command. It will be added when the command
     * is registered on the program.
     * @type {String}
     */
    this.cliName = '';
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
   * @param {String} name              The option name.
   * @param {String} instruction       The option instruction, for example: `-t, --type [type]`.
   * @param {String} [description='']  The option description.
   * @param {String} [defaultValue=''] The option default value, in case is not used on execution.
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
   * Register this command on a CLI program.
   * @param {Command} program  A Commander instance.
   * @param {Object}  cli      The main CLI interface, just for the name.
   * @param {String}  cli.name The CLI interface name.
   * @see https://yarnpkg.com/en/package/commander
   */
  register(program, cli) {
    // Get the name of the program
    this.cliName = cli.name;
    const options = {};
    // If the command should be hidden...
    if (this.hidden) {
      // ...remove it from the help interface.
      options.noHelp = true;
    }

    let command;
    // If the command is a sub program...
    if (this.subProgram) {
      /**
       * ...it gets added without the `.description` property. That's how Commander differentiates
       * a main program command and a sub program command.
       */
      command = program.command(this.command, this.description, options);
    } else {
      // ...otherwise, it gets added as a sub command of the main program.
      command = program
      .command(this.command, '', options)
      .description(this.description);
    }
    // Register all the command options.
    this.options.forEach((name) => {
      const option = this.optionsByName[name];
      command = command.option(
        option.instruction,
        option.description
      );
    });
    // Add the handler for when the command gets executed.
    command.action(this._handle.bind(this));
  }
  /**
   * Generate an instruction for this command.
   * @example
   * // Let's say this command is `destroy [target] [--once]`
   *
   * this.generate({ target: 'pluto' });
   * // Will return `destroy pluto`
   *
   * this.generate({ target: 'moon', once: true });
   * // Will return `destroy moon --once`
   * @param  {Object} [args={}] A dictionary with the arguments and options for the command. If the
   *                            command includes an argument on its `command` property, that
   *                            argument is required.
   * @return {String} The command instruction to run on the CLI interface.
   */
  generate(args = {}) {
    let cmd = this.command;
    const cmdOptions = [];
    // Loop all the `args`...
    Object.keys(args).forEach((name) => {
      const value = args[name];
      const asPlaceholder = `[${name}]`;
      // Check if the current argument should be used on the command instruction...
      if (cmd.includes(asPlaceholder)) {
        // ...if so, replace it on the main command.
        cmd = cmd.replace(asPlaceholder, value);
      } else if (this.optionsByName[name]) {
        // ...otherwise, check if there's an option with the same name as the argument.
        const option = this.optionsByName[name];
        /**
         * Remove the shorthand version of the option instruction, if there's one. For example:
         * `-t, --type [type]` -> `--type [type]`.
         */
        let instruction = option.instruction.split(',').pop().trim();
        // If the option instruction includes the argument as a value (`[argument-name]`)...
        if (instruction.includes(asPlaceholder)) {
          // ...replace it on the option instruction.
          instruction = instruction.replace(asPlaceholder, value);
        } else if (value === false) {
          /**
           * ...but if the value is `false`, then we clear the instruction as it won't be included
           * on the generated string.
           */
          instruction = '';
        }

        // If there's an option instruction...
        if (instruction) {
          // ...add it to the list.
          cmdOptions.push(instruction);
        }
      }
    });

    let options = '';
    // If after the loop, there are option instructions to add...
    if (cmdOptions.length) {
      // ...put them all together on a single string, separated by a space
      options = ['', ...cmdOptions].join(' ');
    }

    // Return the complete command instruction
    return `${this.cliName} ${cmd}${options}`;
  }
  /**
   * Handle the command execution.
   * This method will receive first the captured arguments, then the executed command information
   * from Commander and finally, a dictionary with the options and their values.
   * @example
   * // Let's say the command is `run [target] [--production]`.
   * // And now, it was executed with `run my-target`
   * handle(target, command, options) {
   *   console.log(target);
   *   // Will output `my-target`
   *   console.log(options.production)
   *   // Will output `false`
   * }
   * @throws {Error} if not overwritten.
   * @abstract
   */
  handle() {
    throw new Error('This method must to be overwritten');
  }
  /**
   * A simple wrapper for a `console.log`. Outputs a variable to the CLI interface.
   * @param {String} text The text to output.
   */
  output(text) {
    // eslint-disable-next-line no-console
    console.log(text);
  }
  /**
   * This is the real method that receives the execution of the command and parses it in order to
   * create the options dictionary that the `handle` method receives.
   * @param {Array} args The list of arguments sent by Commander.
   * @ignore
   * @access protected
   */
  _handle(...args) {
    // The actual command is always the last argument.
    const command = args[args.length - 1];
    const options = {};
    // Loop all the known options the command can receive
    Object.keys(this.optionsByName).forEach((name) => {
      const option = this.optionsByName[name];
      let value = '';
      // If the option is on the command...
      if (command[name]) {
        // ...then that's the value that will be used.
        value = command[name];
      }

      /**
       * If no value was found yet, the flag to check on the parent is `true`, there's a parent
       * command and it has an option with that name...
       */
      if (
        !value &&
        this.checkOptionsOnParent &&
        command.parent &&
        command.parent[name]
      ) {
        // ...then that's the value that will be used.
        value = command.parent[name];
      }
      // If no value was found and there's a default value registered for the option...
      if (!value && typeof option.defaultValue !== 'undefined') {
        // ...then that's the value that will be used.
        value = option.defaultValue;
      }

      // Set the option on the dictionary with the value found.
      options[name] = value;
    });

    // Copy the arguments list.
    const newArgs = args.slice();
    // Add the new options dictionary at the end.
    newArgs.push(options);
    // Call the abstract method that handles the execution.
    this.handle(...newArgs);
  }
}

module.exports = CLICommand;
