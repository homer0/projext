const JimpleMock = require('/tests/mocks/jimple.mock');
const NodeWatcherMock = require('/tests/mocks/nodeWatcher.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/nodeWatcher', () => NodeWatcherMock);
jest.mock('fs-extra');
jest.unmock('/src/services/building/buildNodeWatcherProcess');

const fs = require('fs-extra');
require('jasmine-expect');
const {
  BuildNodeWatcherProcess,
  buildNodeWatcherProcess,
} = require('/src/services/building/buildNodeWatcherProcess');

describe('services/building:buildNodeWatcherProcess', () => {
  beforeEach(() => {
    NodeWatcherMock.reset();
    fs.ensureDirSync.mockReset();
    fs.copySync.mockReset();
  });

  it('should be instantiated', () => {
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
    sut = new BuildNodeWatcherProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    // Then
    expect(sut).toBeInstanceOf(BuildNodeWatcherProcess);
    expect(NodeWatcherMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(NodeWatcherMock.mocks.constructor).toHaveBeenCalledWith({
      poll,
    });
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.buildTranspiler).toBe(buildTranspiler);
  });

  it('should log a message when the service starts watching', () => {
    // Given
    const appLogger = {
      success: jest.fn(),
      info: jest.fn(),
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
    const paths = ['path-one', 'path-two'];
    let sut = null;
    // When
    sut = new BuildNodeWatcherProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.setPaths(paths);
    sut.callOnStart();
    // Then
    expect(appLogger.success).toHaveBeenCalledTimes(1);
    expect(appLogger.success).toHaveBeenCalledWith('Starting watch mode');
    expect(appLogger.info).toHaveBeenCalledTimes(1);
    expect(appLogger.info).toHaveBeenCalledWith(paths.map((path) => `watching: ${path}`));
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
    sut = new BuildNodeWatcherProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callOnChange(file);
    // Then
    expect(appLogger.warning).toHaveBeenCalledTimes(1);
    expect(appLogger.warning).toHaveBeenCalledWith(`Change detected on ${file}`);
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
    sut = new BuildNodeWatcherProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callOnInvalidPathForChange();
    // Then
    expect(appLogger.error).toHaveBeenCalledTimes(1);
    expect(appLogger.error)
    .toHaveBeenCalledWith('Error: The file directory is not on the list of allowed paths');
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
    sut = new BuildNodeWatcherProcess(
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
    sut = new BuildNodeWatcherProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callTranspileFile(source, output);
    // Then
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(outputDir);
    expect(appLogger.error).toHaveBeenCalledTimes(2);
    expect(appLogger.error).toHaveBeenCalledWith('Error: The file couldn\'t be updated');
    expect(appLogger.error).toHaveBeenCalledWith(error);
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
    sut = new BuildNodeWatcherProcess(
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
    sut = new BuildNodeWatcherProcess(
      appLogger,
      buildTranspiler,
      projectConfiguration
    );
    sut.callCopyFile(from, to);
    // Then
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(toDir);
    expect(appLogger.error).toHaveBeenCalledTimes(2);
    expect(appLogger.error).toHaveBeenCalledWith('Error: The file couldn\'t be copied');
    expect(appLogger.error).toHaveBeenCalledWith(error);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const poll = 'something';
    const projectConfiguration = {
      getConfig: () => ({
        others: {
          watch: {
            poll,
          },
        },
      }),
    };
    const services = {
      projectConfiguration,
    };
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => (services[service] || service)),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    buildNodeWatcherProcess(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildNodeWatcherProcess');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeFunction();
  });
});
