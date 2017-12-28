jest.unmock('/src/interfaces/cliCommand');

require('jasmine-expect');
const CLICommand = require('/src/interfaces/cliCommand');

// eslint-disable-next-line no-console
const originalLog = console.log;

describe('interfaces:CLICommand', () => {
  afterEach(() => {
    // eslint-disable-next-line no-console
    console.log = originalLog;
  });

  it('should throw an error if used without subclassing it', () => {
    // Given/When/Then
    expect(() => new CLICommand()).toThrow(/CLICommand is an abstract class/i);
  });

  it('should be able to be instantiated when subclassed', () => {
    // Given
    class Sut extends CLICommand {}
    let sut = null;
    // When
    sut = new Sut();
    // Then
    expect(sut).toBeInstanceOf(Sut);
    expect(sut).toBeInstanceOf(CLICommand);
  });

  it('should be able to register new options', () => {
    // Given
    const optionOne = {
      name: 'type',
      instruction: '-t',
    };
    const optionTwo = {
      name: 'env',
      instruction: '-e',
      description: 'Set the environment',
    };
    const optionThree = {
      name: 'build',
      instruction: '-b',
      description: 'Set the build',
      defaultValue: true,
    };
    const numberOfOptions = 3;
    class Sut extends CLICommand {}
    let sut = null;
    // When
    sut = new Sut();
    sut.addOption(optionOne.name, optionOne.instruction);
    sut.addOption(optionTwo.name, optionTwo.instruction, optionTwo.description);
    sut.addOption(
      optionThree.name,
      optionThree.instruction,
      optionThree.description,
      optionThree.defaultValue
    );
    // Then
    expect(sut.options.length).toBe(numberOfOptions);
    expect(sut.options).toEqual([optionOne.name, optionTwo.name, optionThree.name]);
    expect(sut.optionsByName[optionOne.name]).toEqual({
      name: optionOne.name,
      instruction: optionOne.instruction,
      description: '',
      defaultValue: '',
    });
    expect(sut.optionsByName[optionTwo.name]).toEqual({
      name: optionTwo.name,
      instruction: optionTwo.instruction,
      description: optionTwo.description,
      defaultValue: '',
    });
    expect(sut.optionsByName[optionThree.name]).toEqual({
      name: optionThree.name,
      instruction: optionThree.instruction,
      description: optionThree.description,
      defaultValue: optionThree.defaultValue,
    });
  });

  it('should be able to be registered on a CLI program', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      option: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const command = 'test-command';
    const description = 'Test description';
    const option = {
      name: 'env',
      instruction: '-e',
    };
    class Sut extends CLICommand {}
    let sut = null;
    // When
    sut = new Sut();
    sut.command = command;
    sut.description = description;
    sut.addOption(option.name, option.instruction);
    sut.register(program, cli);
    // Then
    expect(sut.cliName).toBe(cli.name);
    expect(program.command).toHaveBeenCalledTimes(1);
    expect(program.command).toHaveBeenCalledWith(command, '', {});
    expect(program.description).toHaveBeenCalledTimes(1);
    expect(program.description).toHaveBeenCalledWith(description);
    expect(program.option).toHaveBeenCalledTimes(1);
    expect(program.option).toHaveBeenCalledWith(option.instruction, '');
    expect(program.action).toHaveBeenCalledTimes(1);
    expect(program.action).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should be able to be registered on a CLI program and hide its help', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const command = 'test-command';
    const description = 'Test description';
    const hidden = true;
    class Sut extends CLICommand {}
    let sut = null;
    // When
    sut = new Sut();
    sut.command = command;
    sut.description = description;
    sut.hidden = hidden;
    sut.register(program, cli);
    // Then
    expect(sut.cliName).toBe(cli.name);
    expect(program.command).toHaveBeenCalledTimes(1);
    expect(program.command).toHaveBeenCalledWith(command, '', {
      noHelp: hidden,
    });
    expect(program.description).toHaveBeenCalledTimes(1);
    expect(program.description).toHaveBeenCalledWith(description);
    expect(program.action).toHaveBeenCalledTimes(1);
    expect(program.action).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should be able to be registered on a CLI program as a sub program', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const command = 'test-command';
    const description = 'Test description';
    const subProgram = true;
    class Sut extends CLICommand {}
    let sut = null;
    // When
    sut = new Sut();
    sut.command = command;
    sut.description = description;
    sut.subProgram = subProgram;
    sut.register(program, cli);
    // Then
    expect(sut.cliName).toBe(cli.name);
    expect(program.command).toHaveBeenCalledTimes(1);
    expect(program.command).toHaveBeenCalledWith(command, description, {});
    expect(program.description).toHaveBeenCalledTimes(0);
    expect(program.action).toHaveBeenCalledTimes(1);
    expect(program.action).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should be able to generate the command as a string', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const command = 'test-command';
    const description = 'Test description';
    const subProgram = true;
    class Sut extends CLICommand {}
    let sut = null;
    let result = '';
    // When
    sut = new Sut();
    sut.command = command;
    sut.description = description;
    sut.subProgram = subProgram;
    sut.register(program, cli);
    result = sut.generate();
    // Then
    expect(sut.cliName).toBe(cli.name);
    expect(program.command).toHaveBeenCalledTimes(1);
    expect(program.command).toHaveBeenCalledWith(command, description, {});
    expect(program.description).toHaveBeenCalledTimes(0);
    expect(program.action).toHaveBeenCalledTimes(1);
    expect(program.action).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toBe(`${cli.name} ${command}`);
  });

  it('should be able to generate the command as a string and include arguments', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const message = 'charito';
    const command = 'test-command [message]';
    const expectedCommand = `test-command ${message}`;
    const description = 'Test description';
    const subProgram = true;
    class Sut extends CLICommand {}
    let sut = null;
    let result = '';
    // When
    sut = new Sut();
    sut.command = command;
    sut.description = description;
    sut.subProgram = subProgram;
    sut.register(program, cli);
    result = sut.generate({ message });
    // Then
    expect(sut.cliName).toBe(cli.name);
    expect(program.command).toHaveBeenCalledTimes(1);
    expect(program.command).toHaveBeenCalledWith(command, description, {});
    expect(program.description).toHaveBeenCalledTimes(0);
    expect(program.action).toHaveBeenCalledTimes(1);
    expect(program.action).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toBe(`${cli.name} ${expectedCommand}`);
  });

  it('should be able to generate the command as a string and include options', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      option: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const option = {
      name: 'env',
      instruction: '-e, --env [env]',
    };
    const env = 'charito';
    const expectedOption = `--env ${env}`;
    const command = 'test-command';
    const description = 'Test description';
    const subProgram = true;
    class Sut extends CLICommand {}
    let sut = null;
    let result = '';
    // When
    sut = new Sut();
    sut.command = command;
    sut.description = description;
    sut.subProgram = subProgram;
    sut.addOption(option.name, option.instruction);
    sut.register(program, cli);
    result = sut.generate({ env });
    // Then
    expect(sut.cliName).toBe(cli.name);
    expect(program.command).toHaveBeenCalledTimes(1);
    expect(program.command).toHaveBeenCalledWith(command, description, {});
    expect(program.description).toHaveBeenCalledTimes(0);
    expect(program.action).toHaveBeenCalledTimes(1);
    expect(program.action).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toBe(`${cli.name} ${command} ${expectedOption}`);
  });

  it('should be able to generate the command as a string and include boolean options', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      option: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const optionOne = {
      name: 'run',
      instruction: '-r, --run',
    };
    const optionTwo = {
      name: 'watch',
      instruction: '-w, --watch',
    };
    const args = {
      run: true,
      watch: false,
    };
    const expectedOptions = '--run';
    const command = 'test-command';
    const description = 'Test description';
    const subProgram = true;
    class Sut extends CLICommand {}
    let sut = null;
    let result = '';
    // When
    sut = new Sut();
    sut.command = command;
    sut.description = description;
    sut.subProgram = subProgram;
    sut.addOption(optionOne.name, optionOne.instruction);
    sut.addOption(optionTwo.name, optionTwo.instruction);
    sut.register(program, cli);
    result = sut.generate(args);
    // Then
    expect(sut.cliName).toBe(cli.name);
    expect(program.command).toHaveBeenCalledTimes(1);
    expect(program.command).toHaveBeenCalledWith(command, description, {});
    expect(program.description).toHaveBeenCalledTimes(0);
    expect(program.action).toHaveBeenCalledTimes(1);
    expect(program.action).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toBe(`${cli.name} ${command} ${expectedOptions}`);
  });

  it('should be able to output messages on the console', () => {
    // Given
    class Sut extends CLICommand {}
    let sut = null;
    const message = 'hello world';
    const log = jest.fn();
    spyOn(console, 'log').and.callFake(log);
    // When
    sut = new Sut();
    sut.output(message);
    // Then
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(message);
  });

  it('should throw an error if the `handle` method is not overwritten', () => {
    // Given
    class Sut extends CLICommand {}
    let sut = null;
    // When/Then
    sut = new Sut();
    expect(() => sut.handle()).toThrow(/This method must to be overwritten/i);
  });

  it('should handle a command an send all the options to the `handle` method', () => {
    // Given
    const program = {
      command: jest.fn(() => program),
      description: jest.fn(() => program),
      option: jest.fn(() => program),
      action: jest.fn(() => program),
    };
    const cli = {
      name: 'some-program',
    };
    const optionOne = {
      name: 'run',
      instruction: '-r, --run',
    };
    const optionTwo = {
      name: 'watch',
      instruction: '-w, --watch',
    };
    const optionThree = {
      name: 'file',
      instruction: '-f, --file',
    };
    const commandInfo = {
      [optionOne.name]: true,
      parent: {
        [optionTwo.name]: true,
      },
    };
    const handlerArgs = [commandInfo];
    const command = 'test-command';
    const description = 'Test description';
    const handle = jest.fn();
    class Sut extends CLICommand {}
    let sut = null;
    let handler = null;
    // When
    sut = new Sut();
    sut.handle = handle;
    sut.command = command;
    sut.description = description;
    sut.addOption(optionOne.name, optionOne.instruction);
    sut.addOption(optionTwo.name, optionTwo.instruction);
    sut.addOption(optionThree.name, optionThree.instruction);
    sut.register(program, cli);
    [[handler]] = program.action.mock.calls;
    handler(...handlerArgs);
    // Then
    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenCalledWith(
      commandInfo,
      {
        [optionOne.name]: true,
        [optionTwo.name]: true,
        [optionThree.name]: '',
      }
    );
  });
});
