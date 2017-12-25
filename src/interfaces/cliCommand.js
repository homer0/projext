class CLICommand {
  constructor() {
    this.command = '';
    this.description = '';
    this.options = [];
    this.optionsByName = {};
    this.checkOptionsOnParent = true;
    this.hidden = false;
    this.subCommand = false;
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

  addCommonOptions(options = ['type']) {
    if (options.includes('type')) {
      this.addOption(
        'type',
        '-t, --type [type]',
        'Which build type: development (default) or production',
        'development'
      );
    }
  }

  register(program, cli) {
    this.cliName = cli.name;
    let command;
    if (this.subCommand) {
      command = program.command(this.command, this.description);
    } else {
      command = program
      .command(this.command)
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

    if (this.hidden) {
      cli.hideCommand(this.command);
    }
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
        }

        cmdOptions.push(instruction);
      }
    });

    const options = cmdOptions.join(' ');
    return `${cmd} ${options}`;
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

      if (!value && option.defaultValue) {
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
