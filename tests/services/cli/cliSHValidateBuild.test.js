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
    const targetsHTML = 'targetsHTML';
    const tempFiles = 'tempFiles';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets, targetsHTML, tempFiles);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateBuildCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.targets).toBe(targets);
    expect(sut.targetsHTML).toBe(targetsHTML);
    expect(sut.tempFiles).toBe(tempFiles);
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
    expect(sut.allowUnknownOptions).toBeTrue();
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
    const targetsHTML = 'targetsHTML';
    const tempFiles = 'tempFiles';
    const run = false;
    const type = 'development';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets, targetsHTML, tempFiles);
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
      bundle: true,
      is: {
        node: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const targetsHTML = 'targetsHTML';
    const tempFiles = 'tempFiles';
    const run = false;
    const type = 'development';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets, targetsHTML, tempFiles);
    sut.handle(targetName, null, { run, type });
    // Then
    expect(appLogger.warning).toHaveBeenCalledTimes(0);
  });

  it('should validate the temp directory when trying to build a browser target', () => {
    // Given
    const appLogger = 'appLogger';
    const targetName = 'some-target';
    const target = {
      is: {
        node: false,
        browser: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const targetsHTML = {
      validate: jest.fn(() => ({ exists: true })),
    };
    const tempFiles = {
      ensureDirectorySync: jest.fn(),
    };
    const run = false;
    const type = 'development';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets, targetsHTML, tempFiles);
    sut.handle(targetName, null, { run, type });
    // Then
    expect(tempFiles.ensureDirectorySync).toHaveBeenCalledTimes(1);
    expect(targetsHTML.validate).toHaveBeenCalledTimes(1);
    expect(targetsHTML.validate).toHaveBeenCalledWith(target);
  });

  it('should log a warning when a browser target doesn\'t have an HTML template', () => {
    // Given
    const appLogger = {
      warning: jest.fn(),
    };
    const targetName = 'some-target';
    const target = {
      is: {
        node: false,
        browser: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const targetsHTML = {
      validate: jest.fn(() => ({ exists: false })),
    };
    const tempFiles = {
      ensureDirectorySync: jest.fn(),
    };
    const run = false;
    const type = 'development';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets, targetsHTML, tempFiles);
    sut.handle(targetName, null, { run, type });
    // Then
    expect(tempFiles.ensureDirectorySync).toHaveBeenCalledTimes(1);
    expect(targetsHTML.validate).toHaveBeenCalledTimes(1);
    expect(targetsHTML.validate).toHaveBeenCalledWith(target);
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
  });

  it('shouldn\'t log a warning for the HTML when the target is a library for production', () => {
    // Given
    const appLogger = {
      warning: jest.fn(),
    };
    const targetName = 'some-target';
    const target = {
      library: true,
      is: {
        node: false,
        browser: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const targetsHTML = 'targetsHTML';
    const tempFiles = 'tempFiles';
    const run = false;
    const type = 'production';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets, targetsHTML, tempFiles);
    sut.handle(targetName, null, { run, type });
    // Then
    expect(appLogger.warning).toHaveBeenCalledTimes(0);
  });

  it('should validate the default target when no name is specified', () => {
    // Given
    const appLogger = {
      warning: jest.fn(),
    };
    const target = {
      is: {
        node: true,
      },
      bundle: false,
      transpile: false,
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
    };
    const targetsHTML = 'targetsHTML';
    const tempFiles = 'tempFiles';
    const run = false;
    const type = 'development';
    let sut = null;
    // When
    sut = new CLISHValidateBuildCommand(appLogger, targets, targetsHTML, tempFiles);
    sut.handle(null, null, { run, type });
    // Then
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
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
    cliSHValidateBuildCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHValidateBuildCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHValidateBuildCommand);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.targets).toBe('targets');
    expect(sut.targetsHTML).toBe('targetsHTML');
    expect(sut.tempFiles).toBe('tempFiles');
  });
});
