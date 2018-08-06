const JimpleMock = require('/tests/mocks/jimple.mock');
const NodeWatcherMock = require('/tests/mocks/nodeWatcher.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/nodeWatcher', () => NodeWatcherMock);
jest.mock('fs-extra');
jest.mock('nodemon', () => {
  // If I let Jest parse the `nodemon` module, it fails when running on parallel.
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
    NodeWatcherMock.reset();
    nodemon.mockReset();
    nodemon.on.mockReset();
    fs.pathExistsSync.mockReset();
    fs.ensureDirSync.mockReset();
  });

  afterEach(() => {
    process.exit = originalExit;
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const buildTranspiler = 'buildTranspiler';
    const poll = 'something';
    const projectConfiguration = {
      others: {
        watch: {
          poll,
        },
      },
    };
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    // Then
    expect(sut).toBeInstanceOf(BuildNodeRunnerProcess);
    expect(NodeWatcherMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(NodeWatcherMock.mocks.constructor).toHaveBeenCalledWith({
      poll,
    });
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.buildTranspiler).toBe(buildTranspiler);
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
    const watch = ['watch-folder'];
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watch);
    // Then
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch,
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
    const watch = ['watch-folder'];
    const transpilationPath = {
      from: 'transpilation/path/source',
      to: 'transpilation/path/output',
    };
    const transpilationPaths = [transpilationPath];
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watch, transpilationPaths);
    // Then
    expect(NodeWatcherMock.mocks.watch).toHaveBeenCalledTimes(1);
    expect(NodeWatcherMock.mocks.watch).toHaveBeenCalledWith(
      [transpilationPath.from],
      transpilationPaths,
      []
    );
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    expect(nodemon.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('crash', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('quit', expect.any(Function));
  });

  it('should run a process that requires transpilation and copying files', () => {
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
    const watch = ['watch-folder'];
    const transpilationPath = {
      from: 'transpilation/path/source',
      to: 'transpilation/path/output',
    };
    const transpilationPaths = [transpilationPath];
    const copyPath = {
      from: 'copy/path/source',
      to: 'copy/path/output',
    };
    const copyPaths = [copyPath];
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watch, transpilationPaths, copyPaths);
    // Then
    expect(NodeWatcherMock.mocks.watch).toHaveBeenCalledTimes(1);
    expect(NodeWatcherMock.mocks.watch).toHaveBeenCalledWith(
      [
        transpilationPath.from,
        copyPath.from,
      ],
      transpilationPaths,
      copyPaths
    );
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    expect(nodemon.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('crash', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('quit', expect.any(Function));
  });

  it('should throw an error if `run` is called more than once', () => {
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
    const watch = ['watch-folder'];
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watch);
    // Then
    expect(() => sut.run(executable, watch))
    .toThrow(/The process is already running/i);
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch,
      ignore: ['*.test.js'],
      env: Object.assign({}, process.env, {}),
    });
    expect(nodemon.on).toHaveBeenCalledTimes(4);
    expect(nodemon.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('crash', expect.any(Function));
    expect(nodemon.on).toHaveBeenCalledWith('quit', expect.any(Function));
  });

  it('should throw an error if the executable doesn\'t exist', () => {
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
    const watch = ['watch-folder'];
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    // Then
    expect(() => sut.run(executable, watch))
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
    const watch = ['watch-folder'];
    let sut = null;
    let onStart = null;
    let onRestart = null;
    let onCrash = null;
    let onQuit = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watch);
    // Then
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch,
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

  it('should process all the nodemon events, with transpilation/copying', () => {
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
    const watch = ['watch-folder'];
    const transpilationPath = {
      from: 'transpilation/path/source',
      to: 'transpilation/path/output',
    };
    const transpilationPaths = [transpilationPath];
    let sut = null;
    let onStart = null;
    let onRestart = null;
    let onCrash = null;
    let onQuit = null;
    // When
    sut = new BuildNodeRunnerProcess(appLogger, buildTranspiler, projectConfiguration);
    sut.run(executable, watch, transpilationPaths);
    // Then
    expect(nodemon).toHaveBeenCalledTimes(1);
    expect(nodemon).toHaveBeenCalledWith({
      script: executable,
      watch,
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
    expect(NodeWatcherMock.mocks.stop).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('should log a message when a file changes, then call the parent class', () => {
    // Given
    const appLogger = {
      warning: jest.fn(),
    };
    const buildTranspiler = 'buildTranspiler';
    const poll = 'something';
    const projectConfiguration = {
      others: {
        watch: {
          poll,
        },
      },
    };
    const file = 'some/random/file.js';
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callOnChange(file);
    // Then
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    expect(appLogger.warning)
    .toHaveBeenCalledWith(`Restarting because a file was modified: ${file}`);
    expect(NodeWatcherMock.mocks.onChange).toHaveBeenCalledTimes(1);
    expect(NodeWatcherMock.mocks.onChange).toHaveBeenCalledWith(file);
  });

  it('should log a message when there\'s no valid path for a changed file', () => {
    // Given
    const appLogger = {
      error: jest.fn(),
    };
    const buildTranspiler = 'buildTranspiler';
    const poll = 'something';
    const projectConfiguration = {
      others: {
        watch: {
          poll,
        },
      },
    };
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callOnInvalidPathForChange();
    // Then
    expect(appLogger.error).toHaveBeenCalledTimes(2);
    expect(appLogger.error)
    .toHaveBeenCalledWith('Error: The file directory is not on the list of allowed paths');
    expect(appLogger.error)
    .toHaveBeenCalledWith('Crash - waiting for file changes before starting...');
  });

  it('should transpile a file', () => {
    // Given
    const appLogger = {
      success: jest.fn(),
    };
    const buildTranspiler = {
      transpileFileSync: jest.fn(),
    };
    const poll = 'something';
    const projectConfiguration = {
      others: {
        watch: {
          poll,
        },
      },
    };
    const source = 'some/original/file.js';
    const outputDir = 'some/output';
    const output = `${outputDir}/file.js`;
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callTranspileFile(source, output);
    // Then
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(outputDir);
    expect(buildTranspiler.transpileFileSync).toHaveBeenCalledTimes(1);
    expect(buildTranspiler.transpileFileSync).toHaveBeenCalledWith({
      source,
      output,
    });
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.success)
    .toHaveBeenCalledWith('The file was successfully copied and transpiled');
  });

  it('should fail to transpile a file', () => {
    // Given
    const appLogger = {
      error: jest.fn(),
    };
    const error = new Error('Something!');
    fs.ensureDirSync.mockImplementationOnce(() => {
      throw error;
    });
    const buildTranspiler = {
      transpileFileSync: jest.fn(),
    };
    const poll = 'something';
    const projectConfiguration = {
      others: {
        watch: {
          poll,
        },
      },
    };
    const source = 'some/original/file.js';
    const outputDir = 'some/output';
    const output = `${outputDir}/file.js`;
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callTranspileFile(source, output);
    // Then
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(outputDir);
    expect(appLogger.error).toHaveBeenCalledTimes(3);
    expect(appLogger.error).toHaveBeenCalledWith('Error: The file couldn\'t be updated');
    expect(appLogger.error).toHaveBeenCalledWith(error);
    expect(appLogger.error)
    .toHaveBeenCalledWith('Crash - waiting for file changes before starting...');
  });

  it('should copy a file', () => {
    // Given
    const appLogger = {
      success: jest.fn(),
    };
    const buildTranspiler = 'buildTranspiler';
    const poll = 'something';
    const projectConfiguration = {
      others: {
        watch: {
          poll,
        },
      },
    };
    const from = 'some/original/file.js';
    const toDir = 'some/output';
    const to = `${toDir}/file.js`;
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callCopyFile(from, to);
    // Then
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(toDir);
    expect(fs.copySync).toHaveBeenCalledTimes(1);
    expect(fs.copySync).toHaveBeenCalledWith(from, to);
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.success)
    .toHaveBeenCalledWith('The file was successfully copied');
  });

  it('should fail to copy a file', () => {
    // Given
    const appLogger = {
      error: jest.fn(),
    };
    const error = new Error('Something!');
    fs.ensureDirSync.mockImplementationOnce(() => {
      throw error;
    });
    const buildTranspiler = 'buildTranspiler';
    const poll = 'something';
    const projectConfiguration = {
      others: {
        watch: {
          poll,
        },
      },
    };
    const from = 'some/original/file.js';
    const toDir = 'some/output';
    const to = `${toDir}/file.js`;
    let sut = null;
    // When
    sut = new BuildNodeRunnerProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callCopyFile(from, to);
    // Then
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(toDir);
    expect(appLogger.error).toHaveBeenCalledTimes(3);
    expect(appLogger.error).toHaveBeenCalledWith('Error: The file couldn\'t be copied');
    expect(appLogger.error).toHaveBeenCalledWith(error);
    expect(appLogger.error)
    .toHaveBeenCalledWith('Crash - waiting for file changes before starting...');
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
