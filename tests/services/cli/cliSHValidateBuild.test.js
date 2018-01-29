const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHValidateBuild');

require('jasmine-expect');
const {
  CLISHValidateBuildCommand,
  cliSHValidateBuildCommand,
} = require('/src/services/cli/cliSHValidateBuild');

describe('services/cli:sh-validate-build', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateBuildCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(2);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
    expect(sut.addOption).toHaveBeenCalledWith(
      'run',
      '-r, --run',
      expect.any(String),
      false
    );
    expect(sut.hidden).toBeTrue();
  });

  it('should log a warning when trying to build a target that doesn\'t need it', () => {
    // Given
    const appLogger = {
      warning: jest.fn(),
    };
    const targetName = 'some-target';
    const target = {
      is: {
        node: true,
      },
      bundle: false,
      transpile: false,
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const run = false;
    const type = 'development';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets);
    sut.handle(targetName, null, { run, type });
    // Then
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
  });

  it('shouldn\'t log a warning when trying to build a target that needs it', () => {
    // Given
    const appLogger = {
      warning: jest.fn(),
    };
    const targetName = 'some-target';
    const target = {
      is: {
        node: false,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const run = false;
    const type = 'development';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets);
    sut.handle(targetName, null, { run, type });
    // Then
    expect(appLogger.warning).toHaveBeenCalledTimes(0);
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
    cliSHValidateBuildCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHValidateBuildCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHValidateBuildCommand);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.targets).toBe('targets');
  });
});
