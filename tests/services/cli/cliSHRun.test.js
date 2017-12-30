const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHRun');

require('jasmine-expect');
const {
  CLISHRunCommand,
  cliSHRunCommand,
} = require('/src/services/cli/cliSHRun');

describe('services/cli:sh-run', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const cliBuildCommand = 'cliBuildCommand';
    let sut = null;
    // When
    sut = new CLISHRunCommand(cliBuildCommand);
    // Then
    expect(sut).toBeInstanceOf(CLISHRunCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.cliBuildCommand).toBe(cliBuildCommand);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.hidden).toBeTrue();
  });

  it('should return the command to run a target when executed', () => {
    // Given
    const target = 'some-target';
    const buildCommand = 'build';
    const cliBuildCommand = {
      generate: jest.fn(() => buildCommand),
    };
    let sut = null;
    // When
    sut = new CLISHRunCommand(cliBuildCommand);
    sut.handle(target);
    // Then
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      target,
      type: 'development',
      run: true,
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
    cliSHRunCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHRunCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHRunCommand);
    expect(sut.cliBuildCommand).toBe('cliBuildCommand');
  });
});
