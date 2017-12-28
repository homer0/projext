class CLICommand {
  constructor() {
    if (new.target === CLICommand) {
      throw new TypeError(
        'CLICommand is an abstract class, it can\'t be instantiated directly'
      );
    }

    this.command = '';
    this.description = '';
    this.options = [];
    this.optionsByName = {};
    this.checkOptionsOnParent = true;
    this.hidden = false;
    this.subProgram = false;
    this.cliName = '';
  }

  addOption(name, instruction, description = '', defaultValue = '') {
    this.optionsByName[name] = {
      name,
      instruction,
      description,
      defaultValue,
    };

    this.options.push(name);
  }

  register(program, cli) {
    this.cliName = cli.name;
    let command;
    const options = {};
    if (this.hidden) {
      options.noHelp = true;
    }

    if (this.subProgram) {
      command = program.command(this.command, this.description, options);
    } else {
      command = program
      .command(this.command, '', options)
      .description(this.description);
    }

    this.options.forEach((name) => {
      const option = this.optionsByName[name];
      command = command.option(
        option.instruction,
        option.description
      );
    });

    command.action(this._handle.bind(this));
  }

  generate(args = {}) {
    let cmd = this.command;
    const cmdOptions = [];
    Object.keys(args).forEach((name) => {
      const value = args[name];
      const asPlaceholder = `[${name}]`;
      if (cmd.includes(asPlaceholder)) {
        cmd = cmd.replace(asPlaceholder, value);
      } else if (this.optionsByName[name]) {
        const option = this.optionsByName[name];
        let instruction = option.instruction.split(',').pop().trim();
        if (instruction.includes(asPlaceholder)) {
          instruction = instruction.replace(asPlaceholder, value);
        } else if (value === false) {
          instruction = '';
        }

        if (instruction) {
          cmdOptions.push(instruction);
        }
      }
    });

    let options = '';
    if (cmdOptions.length) {
      const cmdOptionsString = cmdOptions.join(' ');
      options = ` ${cmdOptionsString}`;
    }

    return `${this.cliName} ${cmd}${options}`;
  }

  handle() {
    throw new Error('This method must to be overwritten');
  }

  output(text) {
    // eslint-disable-next-line no-console
    console.log(text);
  }

  _handle(...args) {
    const command = args[args.length - 1];
    const options = {};
    Object.keys(this.optionsByName).forEach((name) => {
      const option = this.optionsByName[name];
      let value = '';
      if (command[name]) {
        value = command[name];
      }

      if (
        !value &&
        this.checkOptionsOnParent &&
        command.parent &&
        command.parent[name]
      ) {
        value = command.parent[name];
      }

      if (!value && typeof option.defaultValue !== 'undefined') {
        value = option.defaultValue;
      }

      options[name] = value;
    });

    const newArgs = args.slice();
    newArgs.push(options);
    this.handle(...newArgs);
  }
}

module.exports = CLICommand;
