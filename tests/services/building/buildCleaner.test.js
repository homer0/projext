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
    const utils = 'utils';
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration, utils);
    // Then
    expect(sut).toBeInstanceOf(BuildCleaner);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.cleaner).toBe(cleaner);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.utils).toBe(utils);
  });

  it('should clean the project distribution directory', () => {
    // Given
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const utils = 'utils';
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration, utils);
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
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const utils = 'utils';
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration, utils);
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
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const utils = 'utils';
    let sut = null;
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration, utils);
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
      originalOutput: {
        development: {
          js: '[target-name].js',
          css: 'statics/styles/[target-name].css',
          fonts: 'statics/fonts/[name].[ext]',
          images: 'statics/images/[name].[ext]',
        },
        production: {
          js: '[target-name].[hash].js',
          css: 'statics/styles/[target-name].[hash].css',
          fonts: 'statics/fonts/[name].[hash].[ext]',
          images: 'statics/images/[name].[hash].[ext]',
        },
      },
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
    };
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const utils = {
      replacePlaceholders: jest.fn((string) => string),
    };
    let sut = null;
    const expectedPaths = [
      ...Object.keys(target.originalOutput.development)
      .map((name) => target.originalOutput.development[name]),
      ...Object.keys(target.originalOutput.production)
      .map((name) => target.originalOutput.production[name]),
    ];
    const expectedItems = [
      ...expectedPaths,
    ];
    expectedItems.push(...expectedItems.map((filepath) => `${filepath}.gz`));
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration, utils);
    return sut.cleanTarget(target)
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(target.paths.build, expectedItems);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
      expect(utils.replacePlaceholders).toHaveBeenCalledTimes(expectedPaths.length);
      expectedPaths.forEach((expectedPath) => {
        expect(utils.replacePlaceholders).toHaveBeenCalledWith(expectedPath, {
          'target-name': target.name,
          hash: '*',
          name: '*',
          ext: '*',
        });
      });
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
        browser: true,
      },
      name: 'someTarget',
      originalOutput: {
        development: {
          js: 'statics/js/[target-name].js',
          css: 'statics/styles/[target-name].css',
          fonts: 'statics/fonts/[name].[ext]',
          images: 'statics/images/[name].[ext]',
        },
        production: {
          js: 'statics/js/[target-name].[hash].js',
          css: 'statics/styles/[target-name].[hash].css',
          fonts: 'statics/fonts/[name].[hash].[ext]',
          images: 'statics/images/[name].[hash].[ext]',
        },
      },
      html,
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
    };
    const buildPath = 'some-build-path';
    const appLogger = {
      success: jest.fn(),
    };
    const cleaner = jest.fn(() => Promise.resolve());
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const utils = {
      replacePlaceholders: jest.fn((string) => string),
    };
    let sut = null;
    const expectedPaths = [
      ...Object.keys(target.originalOutput.development)
      .map((name) => target.originalOutput.development[name]),
      ...Object.keys(target.originalOutput.production)
      .map((name) => target.originalOutput.production[name]),
    ];
    const expectedItems = [
      ...expectedPaths,
      ...[html.filename],
    ];
    // Add the map for development
    const devJSindex = expectedItems
    .findIndex((path) => path === target.originalOutput.development.js);
    expectedItems.splice(devJSindex + 1, 0, `${target.originalOutput.development.js}.map`);
    // Add the map for production
    const prodJSindex = expectedItems
    .findIndex((path) => path === target.originalOutput.production.js);
    expectedItems.splice(prodJSindex + 1, 0, `${target.originalOutput.production.js}.map`);
    expectedItems.push(...expectedItems.map((filepath) => `${filepath}.gz`));
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration, utils);
    return sut.cleanTarget(target)
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(target.paths.build, expectedItems);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
      expect(utils.replacePlaceholders).toHaveBeenCalledTimes(expectedPaths.length);
      expectedPaths.forEach((expectedPath) => {
        expect(utils.replacePlaceholders).toHaveBeenCalledWith(expectedPath, {
          'target-name': target.name,
          hash: '*',
          name: '*',
          ext: '*',
        });
      });
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
      originalOutput: {
        development: {
          js: '[target-name].js',
          css: 'statics/styles/[target-name].css',
          fonts: 'statics/fonts/[name].[ext]',
          images: 'statics/images/[name].[ext]',
        },
        production: {
          js: '[target-name].[hash].js',
          css: 'statics/styles/[target-name].[hash].css',
          fonts: 'statics/fonts/[name].[hash].[ext]',
          images: 'statics/images/[name].[hash].[ext]',
        },
      },
      paths: {
        source: 'some-target-source',
        build: 'some-target-build',
      },
    };
    const buildPath = 'some-build-path';
    const appLogger = {
      error: jest.fn(),
    };
    const error = new Error('Unknown error');
    const cleaner = jest.fn(() => Promise.reject(error));
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      paths: {
        build: buildPath,
      },
    };
    const utils = {
      replacePlaceholders: jest.fn((string) => string),
    };
    let sut = null;
    const expectedPaths = [
      ...Object.keys(target.originalOutput.development)
      .map((name) => target.originalOutput.development[name]),
      ...Object.keys(target.originalOutput.production)
      .map((name) => target.originalOutput.production[name]),
    ];
    const expectedItems = [
      ...expectedPaths,
    ];
    expectedItems.push(...expectedItems.map((filepath) => `${filepath}.gz`));
    // When
    sut = new BuildCleaner(appLogger, cleaner, pathUtils, projectConfiguration, utils);
    return sut.cleanTarget(target)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((errorResult) => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(buildPath);
      expect(cleaner).toHaveBeenCalledTimes(1);
      expect(cleaner).toHaveBeenCalledWith(target.paths.build, expectedItems);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(utils.replacePlaceholders).toHaveBeenCalledTimes(expectedPaths.length);
      expectedPaths.forEach((expectedPath) => {
        expect(utils.replacePlaceholders).toHaveBeenCalledWith(expectedPath, {
          'target-name': target.name,
          hash: '*',
          name: '*',
          ext: '*',
        });
      });
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
    expect(sut.utils).toBe('utils');
  });
});
