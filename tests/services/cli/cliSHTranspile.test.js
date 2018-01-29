const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHTranspile');

require('jasmine-expect');
const {
  CLISHTranspileCommand,
  cliSHTranspileCommand,
} = require('/src/services/cli/cliSHTranspile');

describe('services/cli:sh-transpile', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const builder = 'builder';
    let sut = null;
    // When
    sut = new CLISHTranspileCommand(builder);
    // Then
    expect(sut).toBeInstanceOf(CLISHTranspileCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.builder).toBe(builder);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(1);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
    expect(sut.hidden).toBeTrue();
  });

  it('should return the command to transpile a target when executed', () => {
    // Given
    const message = 'done';
    const target = 'some-target';
    const type = 'development';
    const builder = {
      transpileTarget: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHTranspileCommand(builder);
    result = sut.handle(target, null, { type });
    // Then
    expect(result).toBe(message);
    expect(builder.transpileTarget).toHaveBeenCalledTimes(1);
    expect(builder.transpileTarget).toHaveBeenCalledWith(target, type);
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
    cliSHTranspileCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHTranspileCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHTranspileCommand);
    expect(sut.builder).toBe('builder');
  });
});
