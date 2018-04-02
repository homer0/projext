/**
 * A helper class for creating commands for the CLI.
 * @abstract
 * @version 1.0
 */
class CLICommand {
  /**
   * Class constructor.
   * @throws {TypeError} If instantiated directly.
   * @abstract
   */
  constructor() {
    if (new.target === CLICommand) {
      throw new TypeError(
        'CLICommand is an abstract class, it can\'t be instantiated directly'
      );
    }
    /**
     * The CLI command instruction. For example `my-command [target]`.
     * @type {string}
     */
    this.command = '';
    /**
     * A description of the command for the help interface.
     * @type {string}
     */
    this.description = '';
    /**
     * A more complete description of the command to show when the command help interface is
     * invoked.
     * If left empty, it won't be used.
     * @type {string}
     */
    this.fullDescription = '';
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
     * @type {boolean}
     */
    this.checkOptionsOnParent = true;
    /**
     * Whether the command and its description should be shown on the CLI interface list of
     * commands.
     * @type {boolean}
     */
    this.hidden = false;
    /**
     * Whether or not a sub program should be executed for this command. Take for example the case
     * of `git`, where `git checkout [branch]` executes `git` as main program, and `checkout` as a
     * sub program. If this is `true`, then a binary with the name of the command should be
     * exported on the `package.json`.
     * @type {boolean}
     */
    this.subProgram = false;
    /**
     * This is the name of the program that runs the command. It will be added when the command
     * is registered on the program.
     * @type {string}
     */
    this.cliName = '';
    /**
     * Whether or not the command supports unknown options. If it does, it will be sent to the
     * `onActivation` method as a parameter.
     * @type {Boolean}
     */
    this.allowUnknownOptions = false;
    /**
     * This dictionary will be completed when the command gets activated. If the command supports
     * unknown options (`allowUnknownOptions`), they'll be parsed and sent to the `handle` method
     * as the last parameter.
     * @type {Object}
     */
    this._unknownOptions = {};
    /**
     * Once registered on the program, this property will hold a reference to the real command
     * the program generates.
     * @type {?Command}
     * @ignore
     * @access protected
     */
    this._command = null;
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
   * Register this command on a CLI program.
   * @param {Command} program  A Commander instance.
   * @param {Object}  cli      The main CLI interface, just for the name.
   * @param {string}  cli.name The CLI interface name.
   * @see https://yarnpkg.com/en/package/commander
   */
  register(program, cli) {
    // Get the real name of the command.
    const commandName = this.command.replace(/\[\w+\]/g, '').trim();
    // Set a listener on the program in order to detect when it gets executed.
    program.on(`command:${commandName}`, (args, unknown) => this._onActivation(args, unknown));
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
    // Enable unknown options if the command supports it
    command.allowUnknownOption(this.allowUnknownOptions);
    // Save the reference
    this._command = command;
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
   * @return {string} The command instruction to run on the CLI interface.
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
      } else if (this.allowUnknownOptions) {
        /**
         * Finally, if is not on the command options and the command supports unknown options,
         * just add it.
         */
        let instruction = `--${name}`;
        // If the option is not a flag, add its value.
        if (value !== true) {
          instruction += ` ${value}`;
        }
        // Push it to the list
        cmdOptions.push(instruction);
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
   * @param {string} text The text to output.
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
    // Add the new options dictionary.
    newArgs.push(options);
    // If the method supports unknown options, add them as the last argument.
    if (this.allowUnknownOptions) {
      newArgs.push(this._unknownOptions);
    }
    // Call the abstract method that handles the execution.
    this.handle(...newArgs);
  }
  /**
   * This method gets called by the program when the command is executed and it takes care of
   * switching the descriptions, if needed, and parsing the unknown options, if supported.
   * @param {Array} args        The list of known arguments the command received.
   * @param {Array} unknownArgs The list of unknown arguments the command received.
   * @ignore
   * @protected
   */
  _onActivation(args, unknownArgs) {
    // Switch the descriptions.
    this._updateDescription();
    // If unknown options are allowed, parsed them and save them on the local property.
    if (this.allowUnknownOptions && unknownArgs && unknownArgs.length) {
      this._unknownOptions = this._parseArgs(unknownArgs);
    }
  }
  /**
   * This method gets called when the command is executed on the program and before reaching the
   * handle method. It checks if the command has a different description for when it gets
   * executed, and if needed, it switches it on the program.
   * @ignore
   * @access protected
   */
  _updateDescription() {
    // If the command reference is available and there's a full description...
    if (this.fullDescription) {
      // ...normalize it by adding the indentation the program uses to show descriptions and help.
      const normalizedDescription = this.fullDescription.replace(/\n/g, '\n  ');
      // Change the command description.
      this._command.description(normalizedDescription);
    }
  }
  /**
   * This method parses a list of CLI arguments into a dicitionary.
   * @example
   * const args = [
   *   '--include=something',
   *   '-i',
   *   'somes',
   *   '--exclude',
   *   '--type',
   *   'building',
   *   '-x=y',
   * ];
   * console.log(this._parseArgs(args));
   * // Will output `{include: 'something', i: 'somes', exclude: true, type: 'building', x: 'y'}`
   * @param {Array} args A list of arguments.
   * @return {Object}
   * @ignore
   * @access protected
   */
  _parseArgs(args) {
    // Use Commander to normalize the arguments list.
    const list = this._command.normalize(args);
    // Define the dictionary to return.
    const parsed = {};
    /**
     * Define the regex that will validate if an argument is an _"option header"_ (`--[something]`)
     * or a value.
     */
    const headerRegex = /^-(?:-)?/;
    /**
     * Every time the loop finds a header, it will be set on this variable, so the next time a value
     * is found, it can be assigned to that header on the return dictionary.
     */
    let currentHeader;
    /**
     * The commander `normalize` method transforms `-x=y` into `['-x', '-=', '-y']`. On the first
     * iteration, `-x` will be marked as a header, on the following iteration, the loop will check
     * for `-=`, ignore it and mark this variable as `true` so on the final iteration, despite the
     * fact that the value starts `-`, the method should remove the `-` and save it as a value for
     * `-x`.
     */
    let nextValue = false;
    // Loop the list...
    list.forEach((item) => {
      // Check whether the current item is a header or not.
      const isHeader = item.match(headerRegex);
      // If it is a header...
      if (isHeader) {
        // ...and the flag for short instructions is `true`...
        if (nextValue) {
          // ...remove the leading `-` and save it as a value for the current header.
          parsed[currentHeader] = item.substr(1);
          // Reset the flags.
          currentHeader = null;
          nextValue = false;
        } else if (currentHeader && item === '-=') {
          /**
           * If there's a header and the current argument is `-=`, set the flag for short
           * instructions to `true`.
           */
          nextValue = true;
        } else if (currentHeader) {
          /**
           * If this is another header, it means that the argument is a flag, so save the current
           * header as `true` and change the current header to the current item.
           */
          parsed[currentHeader] = true;
          currentHeader = item.replace(headerRegex, '');
        } else {
          // Set the current header to the current item.
          currentHeader = item.replace(headerRegex, '');
        }
      } else if (currentHeader) {
        /**
         * If there's a header, this means the current item is a value, so set it to the current
         * header and reset the variable.
         */
        parsed[currentHeader] = item;
        currentHeader = null;
      }
    });
    // Return the parsed object.
    return parsed;
  }
}

module.exports = CLICommand;
