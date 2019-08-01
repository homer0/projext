const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('util');
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliInfo');

require('jasmine-expect');
const util = require('util');
const {
  CLIInfoCommand,
  cliInfoCommand,
} = require('/src/services/cli/cliInfo');

describe('services/cli:info', () => {
  beforeEach(() => {
    CLICommandMock.reset();
    util.inspect.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const projectConfiguration = 'projectConfiguration';
    let sut = null;
    // When
    sut = new CLIInfoCommand(appLogger, projectConfiguration);
    // Then
    expect(sut).toBeInstanceOf(CLIInfoCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
  });

  it('should log all the project settings', () => {
    // Given
    const message = 'done';
    util.inspect.mockReturnValueOnce(message);
    const appLogger = {
      success: jest.fn(),
    };
    const projectConfiguration = {
      hello: 'charito!',
    };
    let sut = null;
    // When
    sut = new CLIInfoCommand(appLogger, projectConfiguration);
    sut.handle();
    // Then
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.success).toHaveBeenCalledWith(
      expect.stringMatching(/showing all the project settings/i)
    );
    expect(util.inspect).toHaveBeenCalledTimes(1);
    expect(util.inspect).toHaveBeenCalledWith(projectConfiguration, {
      colors: true,
      depth: 7,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(message);
  });

  it('should log an specific setting', () => {
    // Given
    const message = 'done';
    util.inspect.mockReturnValueOnce(message);
    const appLogger = {
      success: jest.fn(),
    };
    const settingName = 'hello';
    const projectConfiguration = {
      [settingName]: 'charito!',
    };
    let sut = null;
    // When
    sut = new CLIInfoCommand(appLogger, projectConfiguration);
    sut.handle(settingName);
    // Then
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.success).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`showing '${settingName}'`, 'i'))
    );
    expect(util.inspect).toHaveBeenCalledTimes(1);
    expect(util.inspect).toHaveBeenCalledWith(projectConfiguration[settingName], {
      colors: true,
      depth: 7,
    });
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(message);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => service } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cliInfoCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliInfoCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIInfoCommand);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
  });
});
