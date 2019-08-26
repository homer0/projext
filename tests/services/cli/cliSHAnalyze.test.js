const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHAnalyze');

require('jasmine-expect');
const {
  CLISHAnalyzeCommand,
  cliSHAnalyzeCommand,
} = require('/src/services/cli/cliSHAnalyze');

describe('services/cli:sh-analyze', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const cliBuildCommand = 'cliBuildCommand';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHAnalyzeCommand(cliBuildCommand, targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHAnalyzeCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.cliBuildCommand).toBe(cliBuildCommand);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.hidden).toBeTrue();
    expect(sut.addOption).toHaveBeenCalledTimes(1);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should return the command to analyze a target when executed', () => {
    // Given
    const target = 'some-target';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getTarget: jest.fn(() => ({ name: target })),
    };
    const options = {
      type: 'development',
    };
    let sut = null;
    // When
    sut = new CLISHAnalyzeCommand(cliBuildCommand, targets);
    sut.handle(target, null, options);
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type: options.type,
      analyze: true,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should return the command to analyze a target and include unkown options', () => {
    // Given
    const target = 'some-target';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getTarget: jest.fn(() => ({ name: target })),
    };
    const options = {
      type: 'development',
    };
    const unknownOptName = 'name';
    const unknownOptValue = 'Rosario';
    const unknownOptions = {
      target: 'someTarget',
      [unknownOptName]: unknownOptValue,
    };
    let sut = null;
    // When
    sut = new CLISHAnalyzeCommand(cliBuildCommand, targets);
    sut.handle(target, null, options, unknownOptions);
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type: options.type,
      analyze: true,
      [unknownOptName]: unknownOptValue,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(buildCommand);
  });

  it('should return the command to analyze the default target when executed', () => {
    // Given
    const target = 'some-target';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    const targets = {
      getDefaultTarget: jest.fn(() => ({ name: target })),
    };
    let sut = null;
    // When
    sut = new CLISHAnalyzeCommand(cliBuildCommand, targets);
    sut.handle(null, null, {});
    // Then
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      analyze: true,
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
    cliSHAnalyzeCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHAnalyzeCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHAnalyzeCommand);
    expect(sut.cliBuildCommand).toBe('cliBuildCommand');
    expect(sut.targets).toBe('targets');
  });
});
