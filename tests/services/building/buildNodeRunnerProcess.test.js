const JimpleMock = require('/tests/mocks/jimple.mock');
const WatchpackMock = require('/tests/mocks/watchpack.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('watchpack', () => WatchpackMock);
jest.mock('fs-extra');
jest.mock('nodemon', () => {
  // If I let Jest parse the nodemon module, it fails when running on parallel.
  const mockedNodemon = jest.fn();
  mockedNodemon.on = jest.fn();
  return mockedNodemon;
});
jest.unmock('/src/services/building/buildNodeRunnerProcess');

require('jasmine-expect');
const fs = require('fs-extra');
const nodemon = require('nodemon');
const {
  BuildNodeRunnerProcess,
  buildNodeRunnerProcess,
} = require('/src/services/building/buildNodeRunnerProcess');

const originalExit = process.exit;

describe('services/building:buildNodeRunnerProcess', () => {
  beforeEach(() => {
    WatchpackMock.reset();
    nodemon.mockReset();
    nodemon.on.mockReset();
    fs.pathExistsSync.mockReset();
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const buildTranspiler = 'buildTranspiler';
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    // Then
    expect(sut).toBeInstanceOf(BuildNodeRunnerProcess);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.buildTranspiler).toBe(buildTranspiler);
    expect(sut.watcher).toBeInstanceOf(WatchpackMock);
    expect(sut.watcher.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.watcher.constructorMock).toHaveBeenCalledWith({
      poll: projectConfiguration.others.watch.poll,
    });
  });

  it('should run a process', () => {
    // Given
    const appLogger = 'appLogger';
    const buildTranspiler = 'buildTranspiler';
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'source-path';
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watchOn, sourcePath, executionPath);
    // Then
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch: watchOn,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    expect(nodemon.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('crash', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('quit', expect.any(Function));
  });

  it('should run a process that requires transpilation', () => {
    // Given
    const appLogger = 'appLogger';
    const buildTranspiler = 'buildTranspiler';
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'build-path';
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watchOn, sourcePath, executionPath);
    // Then
    expect(sut.watcher.watch).toHaveBeenCalledTimes(1);
    expect(sut.watcher.watch).toHaveBeenCalledWith([], [sourcePath]);
    expect(sut.watcher.on).toHaveBeenCalledTimes(1);
    expect(sut.watcher.on).toHaveBeenCalledWith('change', expect.any(Function));
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch: watchOn,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    expect(nodemon.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('crash', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('quit', expect.any(Function));
  });

  it('should throw an error `run` is called more than once', () => {
    // Given
    const appLogger = 'appLogger';
    const buildTranspiler = 'buildTranspiler';
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'source-path';
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watchOn, sourcePath, executionPath);
    // Then
    expect(() => sut.run(executable, watchOn, sourcePath, executionPath))
    .toThrow(/The process is already running/i);
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch: watchOn,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    expect(nodemon.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('crash', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('quit', expect.any(Function));
  });

  it('should throw an error `run` if the executable doesn\'t exist', () => {
    // Given
    const appLogger = 'appLogger';
    const buildTranspiler = 'buildTranspiler';
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'source-path';
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    // Then
    expect(() => sut.run(executable, watchOn, sourcePath, executionPath))
    .toThrow(/The target executable doesn't exist/i);
  });

  it('should process all the nodemon events', () => {
    // Given
    const exit = jest.fn();
    process.exit = exit;
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
    const buildTranspiler = 'buildTranspiler';
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'source-path';
    let sut = null;
    let onStart = null;
    let onRestart = null;
    let onCrash = null;
    let onQuit = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watchOn, sourcePath, executionPath);
    // Then
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch: watchOn,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    [
      [, onStart],
      [, onRestart],
      [, onCrash],
      [, onQuit],
    ] = nodemon.on.mock.calls;
    // - Basic start
    onStart();
    // - Second start to check that the messages are not logged
    onStart();
    // - Forced restart
    onRestart();
    // - Restart because files changed
    onRestart(['some-file']);
    onCrash();
    onQuit();

    expect(appLogger.success).toHaveBeenCalledTimes([
      'basic start',
      'forced restart',
      'restart because files changed',
    ].length);
    expect(appLogger.info).toHaveBeenCalledTimes([
      'basic start',
      'forced restart',
      'restart because files changed',
    ].length);
    expect(appLogger.warning).toHaveBeenCalledTimes([
      'forced restart',
      'restart because files changed',
    ].length);
    expect(appLogger.error).toHaveBeenCalledTimes([
      'crash',
    ].length);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('should process all the nodemon events with a transpiled executable', () => {
    // Given
    const exit = jest.fn();
    process.exit = exit;
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };
    const buildTranspiler = 'buildTranspiler';
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'build-path';
    let sut = null;
    let onStart = null;
    let onRestart = null;
    let onCrash = null;
    let onQuit = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watchOn, sourcePath, executionPath);
    // Then
    expect(sut.watcher.watch).toHaveBeenCalledTimes(1);
    expect(sut.watcher.watch).toHaveBeenCalledWith([], [sourcePath]);
    expect(sut.watcher.on).toHaveBeenCalledTimes(1);
    expect(sut.watcher.on).toHaveBeenCalledWith('change', expect.any(Function));
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch: watchOn,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    [
      [, onStart],
      [, onRestart],
      [, onCrash],
      [, onQuit],
    ] = nodemon.on.mock.calls;
    // - Basic start
    onStart();
    // - Second start to check that the messages are not logged
    onStart();
    // - Forced restart
    onRestart();
    // - Restart because files changed
    onRestart(['some-file']);
    onCrash();
    onQuit();

    expect(appLogger.success).toHaveBeenCalledTimes([
      'basic start',
      'forced restart',
      'restart because files changed',
    ].length);
    expect(appLogger.info).toHaveBeenCalledTimes([
      'basic start',
      'forced restart',
      'restart because files changed',
    ].length);
    expect(appLogger.warning).toHaveBeenCalledTimes([
      'forced restart',
    ].length);
    expect(appLogger.error).toHaveBeenCalledTimes([
      'crash',
    ].length);
    expect(sut.watcher.close).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('should watch files and transpile them when they change', () => {
    // Given
    const appLogger = {
      success: jest.fn(),
      warning: jest.fn(),
    };
    const buildTranspiler = {
      transpileFileSync: jest.fn(),
    };
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'build-path';
    const changedFile = 'some-file.js';
    const changedFilePath = `${sourcePath}/${changedFile}`;
    const changedBuildedFilePath = `${executionPath}/${changedFile}`;
    let sut = null;
    let onChange = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watchOn, sourcePath, executionPath);
    // Then
    expect(sut.watcher.watch).toHaveBeenCalledTimes(1);
    expect(sut.watcher.watch).toHaveBeenCalledWith([], [sourcePath]);
    expect(sut.watcher.on).toHaveBeenCalledTimes(1);
    expect(sut.watcher.on).toHaveBeenCalledWith('change', expect.any(Function));
    [[, onChange]] = sut.watcher.on.mock.calls;
    onChange(changedFilePath);
    expect(buildTranspiler.transpileFileSync).toHaveBeenCalledTimes(1);
    expect(buildTranspiler.transpileFileSync).toHaveBeenCalledWith({
      source: changedFilePath,
      output: changedBuildedFilePath,
    });
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    expect(appLogger.success).toHaveBeenCalledTimes(1);
  });

  it('should crash while trying to transpile a file', () => {
    // Given
    const appLogger = {
      error: jest.fn(),
      warning: jest.fn(),
    };
    const buildTranspiler = {
      transpileFileSync: jest.fn(() => {
        throw new Error();
      }),
    };
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const executable = 'file.js';
    const watchOn = ['watch-folder'];
    const sourcePath = 'source-path';
    const executionPath = 'build-path';
    const changedFile = 'some-file.js';
    const changedFilePath = `${sourcePath}/${changedFile}`;
    const changedBuildedFilePath = `${executionPath}/${changedFile}`;
    let sut = null;
    let onChange = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watchOn, sourcePath, executionPath);
    // Then
    expect(sut.watcher.watch).toHaveBeenCalledTimes(1);
    expect(sut.watcher.watch).toHaveBeenCalledWith([], [sourcePath]);
    expect(sut.watcher.on).toHaveBeenCalledTimes(1);
    expect(sut.watcher.on).toHaveBeenCalledWith('change', expect.any(Function));
    [[, onChange]] = sut.watcher.on.mock.calls;
    onChange(changedFilePath);
    expect(buildTranspiler.transpileFileSync).toHaveBeenCalledTimes(1);
    expect(buildTranspiler.transpileFileSync).toHaveBeenCalledWith({
      source: changedFilePath,
      output: changedBuildedFilePath,
    });
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    expect(appLogger.error).toHaveBeenCalledTimes([
      'error information',
      'exception',
      'nodemon event',
    ].length);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const projectConfiguration = {
      others: {
        watch: {
          poll: true,
        },
      },
    };
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => projectConfiguration } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    buildNodeRunnerProcess(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildNodeRunnerProcess');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeFunction();
  });
});
