const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHWatch');

require('jasmine-expect');
const {
  CLISHWatchCommand,
  cliSHWatchCommand,
} = require('/src/services/cli/cliSHWatch');

describe('services/cli:sh-watch', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const cliBuildCommand = 'cliBuildCommand';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHWatchCommand(cliBuildCommand, targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHWatchCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.cliBuildCommand).toBe(cliBuildCommand);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.hidden).toBeTrue();
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should return the command to watch a target when executed', () => {
    // Given
    const target = 'some-target';
    const type = 'development';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getTarget: jest.fn(() => ({ name: target })),
    };
    let sut = null;
    // When
    sut = new CLISHWatchCommand(cliBuildCommand, targets);
    sut.handle(target, null, { type });
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type,
      watch: true,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should return the command to watch a target when executed and include unkown options', () => {
    // Given
    const target = 'some-target';
    const type = 'development';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getTarget: jest.fn(() => ({ name: target })),
    };
    const unknownOptName = 'name';
    const unknownOptValue = 'Rosario';
    const unknownOptions = {
      target: 'someTarget',
      [unknownOptName]: unknownOptValue,
    };
    let sut = null;
    // When
    sut = new CLISHWatchCommand(cliBuildCommand, targets);
    sut.handle(target, null, { type }, unknownOptions);
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type,
      watch: true,
      [unknownOptName]: unknownOptValue,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should return the command to run the default target when executed', () => {
    // Given
    const target = 'some-target';
    const type = 'development';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getDefaultTarget: jest.fn(() => ({ name: target })),
    };
    let sut = null;
    // When
    sut = new CLISHWatchCommand(cliBuildCommand, targets);
    sut.handle(null, null, { type });
    // Then
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type,
      watch: true,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cliSHWatchCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHWatchCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHWatchCommand);
    expect(sut.cliBuildCommand).toBe('cliBuildCommand');
    expect(sut.targets).toBe('targets');
  });
});
