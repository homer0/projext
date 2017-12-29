const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/building/buildCleaner');

require('jasmine-expect');
const fs = require('fs-extra');
const { BuildCleaner, buildCleaner } = require('/src/services/building/buildCleaner');

describe('services/building:buildCleaner', () => {
  beforeEach(() => {
    fs.readdir.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const cleaner = 'cleaner';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    // Then
    expect(sut).toBeInstanceOf(BuildCleaner);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.cleaner).toBe('cleaner');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
  });

  it('should clean the project distribution directory', () => {
    // Given
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    return sut.cleanAll()
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(buildPath, '**');
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to clean the project distribution directory', () => {
    // Given
    const buildPath = 'some-build-path';
    const appLogger = {
      error: jest.fn(),
    };
    const error = new Error('Unknown error');
    const cleaner = jest.fn(() => Promise.reject(error));
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    return sut.cleanAll()
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((errorResult) => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(buildPath, '**');
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(errorResult).toBe(error);
    });
  });

  it('should clean a node target files from the distribution directory', () => {
    // Given
    const target = {
      is: {
        node: true,
      },
      bundle: false,
      name: 'someTarget',
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
    };
    const targetFiles = [
      'start.js',
      'index.js',
    ];
    fs.readdir.mockImplementationOnce(() => Promise.resolve(targetFiles));
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    return sut.cleanTarget(target)
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(fs.readdir).toHaveBeenCalledTimes(1);
      expect(fs.readdir).toHaveBeenCalledWith(target.paths.source);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(target.paths.build, targetFiles);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should clean a bundled node target files from the distribution directory', () => {
    // Given
    const target = {
      is: {
        node: true,
      },
      bundle: true,
      name: 'someTarget',
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
    };
    let targetNames = null;
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    targetNames = sut.getTargetNamesVariation(target.name);
    return sut.cleanTarget(target)
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(target.paths.build, targetNames);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should clean a browser target files from the distribution directory', () => {
    // Given
    const html = {
      filename: 'index.html',
    };
    const target = {
      is: {
        node: false,
      },
      name: 'someTarget',
      html,
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
    };
    let targetNames = null;
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const output = {
      js: 'statics/js',
      fonts: 'statics/fonts',
      css: 'statics/css',
      images: 'statics/img',
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
        output,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    targetNames = sut.getTargetNamesVariation(target.name);
    return sut.cleanTarget(target)
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(
        target.paths.build,
        [
          ...targetNames,
          ...Object.keys(output).map((folder) => output[folder]),
          ...[
            html.filename,
            `${html.filename}.gz`,
          ],
        ]
      );
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should clean a library browser target files from the distribution directory', () => {
    // Given
    const target = {
      is: {
        node: false,
      },
      name: 'someTarget',
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
      library: true,
    };
    let targetNames = null;
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const output = {
      js: 'statics/js',
      fonts: 'statics/fonts',
      css: 'statics/css',
      images: 'statics/img',
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
        output,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    targetNames = sut.getTargetNamesVariation(target.name);
    return sut.cleanTarget(target)
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(
        target.paths.build,
        [
          ...targetNames,
          ...Object.keys(output).map((folder) => output[folder]),
        ]
      );
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to clean a target files from the distribution directory', () => {
    // Given
    const target = {
      is: {
        node: true,
      },
      bundle: true,
      name: 'someTarget',
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
    };
    let targetNames = null;
    const buildPath = 'some-build-path';
    const appLogger = {
      error: jest.fn(),
    };
    const error = new Error('Unknown error');
    const cleaner = jest.fn(() => Promise.reject(error));
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration);
    targetNames = sut.getTargetNamesVariation(target.name);
    return sut.cleanTarget(target)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((errorResult) => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(target.paths.build, targetNames);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(errorResult).toBe(error);
    });
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
    buildCleaner(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildCleaner');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildCleaner);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.cleaner).toBe('cleaner');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
  });
});
