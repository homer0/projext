const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHValidateWatch');

require('jasmine-expect');
const {
  CLISHValidateWatchCommand,
  cliSHValidateWatchCommand,
} = require('/src/services/cli/cliSHValidateWatch');

describe('services/cli:validate-watch', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHValidateWatchCommand(targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateWatchCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.targets).toBe(targets);
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
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should validate the target exists when executed', () => {
    // Given
    const message = 'done';
    const target = 'some-target';
    const targets = {
      getTarget: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHValidateWatchCommand(targets);
    result = sut.handle(target);
    // Then
    expect(result).toBe(message);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
  });

  it('should validate the default target when no name is specified', () => {
    // Given
    const message = 'done';
    const targets = {
      getDefaultTarget: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHValidateWatchCommand(targets);
    result = sut.handle();
    // Then
    expect(result).toBe(message);
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
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
    cliSHValidateWatchCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHValidateWatchCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHValidateWatchCommand);
    expect(sut.targets).toBe('targets');
  });
});
