const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('shelljs', () => ({
  which: jest.fn(),
  exec: jest.fn(),
}));
jest.mock('fs-extra');
jest.unmock('/src/services/common/versionUtils');

require('jasmine-expect');
const fs = require('fs-extra');
const shell = require('shelljs');
const { VersionUtils, versionUtils } = require('/src/services/common/versionUtils');

describe('services/common:versionUtils', () => {
  beforeEach(() => {
    fs.readFileSync.mockReset();
    fs.statSync.mockReset();
    fs.writeFile.mockReset();
    shell.which.mockReset();
    shell.exec.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    let sut = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    // Then
    expect(sut).toBeInstanceOf(VersionUtils);
    expect(sut.environmentUtils).toBe(environmentUtils);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.pathUtils).toBe(pathUtils);
  });

  it('should return the version set on the environment', () => {
    // Given
    const variable = 'VERSION';
    const version = 'latest';
    const environmentUtils = {
      get: jest.fn(() => version),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    let sut = null;
    let result = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    result = sut.getEnvironmentVersion(variable);
    // Then
    expect(result).toBe(version);
    expect(environmentUtils.get).toHaveBeenCalledTimes(1);
    expect(environmentUtils.get).toHaveBeenCalledWith(
      variable,
      sut.fallbackVersion
    );
  });

  it('should return the version set on the environment (without fallback)', () => {
    // Given
    const variable = 'VERSION';
    const version = 'latest';
    const environmentUtils = {
      get: jest.fn(() => version),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    let sut = null;
    let result = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    result = sut.getEnvironmentVersion(variable, false);
    // Then
    expect(result).toBe(version);
    expect(environmentUtils.get).toHaveBeenCalledTimes(1);
    expect(environmentUtils.get).toHaveBeenCalledWith(
      variable,
      undefined
    );
  });

  it('should return the version saved on a file', () => {
    // Given
    const file = 'revision';
    const version = 'charito';
    const environmentUtils = 'environmentUtils';
    const appLogger = 'appLogger';
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    fs.readFileSync.mockImplementationOnce(() => version);
    let sut = null;
    let result = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    result = sut.getVersionFromFile(file);
    // Then
    expect(result).toBe(version);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf-8');
    expect(pathUtils.join).toHaveBeenCalledWith(file);
  });

  it('should fail to read the version saved on a file and return an empty string', () => {
    // Given
    const file = 'revision';
    const environmentUtils = 'environmentUtils';
    const appLogger = 'appLogger';
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    const error = new Error('Unknown error');
    fs.readFileSync.mockImplementationOnce(() => {
      throw error;
    });
    let sut = null;
    let result = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    result = sut.getVersionFromFile(file);
    // Then
    expect(result).toBeEmptyString();
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf-8');
    expect(pathUtils.join).toHaveBeenCalledWith(file);
  });

  it('should return the file version after checking both the file and the env variable', () => {
    // Given
    const variable = 'VERSION';
    const file = 'revision';
    const version = 'charito';
    const environmentUtils = 'environmentUtils';
    const appLogger = 'appLogger';
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    fs.readFileSync.mockImplementationOnce(() => version);
    let sut = null;
    let result = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    result = sut.getVersion(file, variable);
    // Then
    expect(result).toBe(version);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf-8');
    expect(pathUtils.join).toHaveBeenCalledWith(file);
  });

  it('should load the version from the file only once', () => {
    // Given
    const variable = 'VERSION';
    const file = 'revision';
    const version = 'charito';
    const environmentUtils = 'environmentUtils';
    const appLogger = 'appLogger';
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    fs.readFileSync.mockImplementationOnce(() => version);
    let sut = null;
    let firstResult = null;
    let secondResult = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    firstResult = sut.getVersion(file, variable);
    secondResult = sut.getVersion(file, variable);
    // Then
    expect(firstResult).toBe(version);
    expect(secondResult).toBe(version);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf-8');
    expect(pathUtils.join).toHaveBeenCalledWith(file);
  });

  it('should try to load the version from the file if the first time failed', () => {
    // Given
    const variable = 'VERSION';
    const file = 'revision';
    const version = 'charito';
    const environmentUtils = {
      get: jest.fn((variableName, fallback) => fallback),
    };
    const appLogger = 'appLogger';
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    const error = new Error('Unknown error');
    fs.readFileSync.mockImplementationOnce(() => {
      throw error;
    });
    fs.readFileSync.mockImplementationOnce(() => version);
    let sut = null;
    let firstResult = null;
    let secondResult = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    firstResult = sut.getVersion(file, variable);
    secondResult = sut.getVersion(file, variable);
    // Then
    expect(firstResult).toBe(sut.fallbackVersion);
    expect(secondResult).toBe(version);
    expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf-8');
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf-8');
    expect(pathUtils.join).toHaveBeenCalledTimes(2);
    expect(pathUtils.join).toHaveBeenCalledWith(file);
    expect(pathUtils.join).toHaveBeenCalledWith(file);
    expect(environmentUtils.get).toHaveBeenCalledTimes(1);
    expect(environmentUtils.get).toHaveBeenCalledWith(
      variable,
      sut.fallbackVersion
    );
  });

  it('should return the env version after checking both the file and the env variable', () => {
    // Given
    const variable = 'VERSION';
    const version = 'latest';
    const file = 'revision';
    const environmentUtils = {
      get: jest.fn(() => version),
    };
    const appLogger = 'appLogger';
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    const error = new Error('Unknown error');
    fs.readFileSync.mockImplementationOnce(() => {
      throw error;
    });
    let sut = null;
    let result = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    result = sut.getVersion(file, variable);
    // Then
    expect(result).toBe(version);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(file, 'utf-8');
    expect(pathUtils.join).toHaveBeenCalledWith(file);
    expect(environmentUtils.get).toHaveBeenCalledTimes(1);
    expect(environmentUtils.get).toHaveBeenCalledWith(
      variable,
      sut.fallbackVersion
    );
  });

  it('should create the revision file using the environment variable', () => {
    // Given
    const variable = 'VERSION';
    const version = 'latest';
    const file = 'revision';
    const environmentUtils = {
      get: jest.fn(() => version),
    };
    const appLogger = {
      success: jest.fn(),
    };
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    fs.statSync.mockImplementationOnce(() => {
      throw new Error();
    });
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    let sut = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    return sut.createRevisionFile(file, variable)
    .then(() => {
      // Then
      expect(fs.statSync).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledWith('./.git');
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(file);
      expect(environmentUtils.get).toHaveBeenCalledTimes(1);
      expect(environmentUtils.get).toHaveBeenCalledWith(
        variable,
        undefined
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(file, version);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should create the revision file using the repository hash', () => {
    // Given
    const variable = 'VERSION';
    const version = 'latest';
    const file = 'revision';
    const environmentUtils = {
      get: jest.fn(() => ''),
    };
    const appLogger = {
      success: jest.fn(),
    };
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    fs.statSync.mockImplementationOnce(() => true);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    shell.which.mockImplementationOnce(() => true);
    shell.exec.mockImplementationOnce(() => ({
      code: 0,
      trim: () => version,
    }));
    let sut = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    return sut.createRevisionFile(file, variable)
    .then(() => {
      // Then
      expect(fs.statSync).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledWith('./.git');
      expect(shell.which).toHaveBeenCalledTimes(1);
      expect(shell.which).toHaveBeenCalledWith('git');
      expect(shell.exec).toHaveBeenCalledTimes(1);
      expect(shell.exec).toHaveBeenCalledWith('git rev-parse HEAD', { silent: true });
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(file);
      expect(environmentUtils.get).toHaveBeenCalledTimes(1);
      expect(environmentUtils.get).toHaveBeenCalledWith(
        variable,
        undefined
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(file, version);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to create the revision file because it can\'t read the repository hash', () => {
    // Given
    const variable = 'VERSION';
    const file = 'revision';
    const environmentUtils = {
      get: jest.fn(() => ''),
    };
    const appLogger = {
      error: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    fs.statSync.mockImplementationOnce(() => true);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    shell.which.mockImplementationOnce(() => true);
    shell.exec.mockImplementationOnce(() => ({
      code: 1,
    }));
    let sut = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    return sut.createRevisionFile(file, variable)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((error) => {
      // Then
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/The project is not running on a GIT environment/i);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledWith('./.git');
      expect(shell.which).toHaveBeenCalledTimes(1);
      expect(shell.which).toHaveBeenCalledWith('git');
      expect(shell.exec).toHaveBeenCalledTimes(1);
      expect(shell.exec).toHaveBeenCalledWith('git rev-parse HEAD', { silent: true });
      expect(environmentUtils.get).toHaveBeenCalledTimes(1);
      expect(environmentUtils.get).toHaveBeenCalledWith(
        variable,
        undefined
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(0);
    });
  });

  it('should fail to create the revision file because there\'s no way to obtain a version', () => {
    // Given
    const variable = 'VERSION';
    const file = 'revision';
    const environmentUtils = {
      get: jest.fn(() => ''),
    };
    const appLogger = {
      error: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    fs.statSync.mockImplementationOnce(() => true);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    shell.which.mockImplementationOnce(() => false);
    let sut = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    return sut.createRevisionFile(file, variable)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((error) => {
      // Then
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/The project is not running on a GIT environment/i);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledWith('./.git');
      expect(shell.which).toHaveBeenCalledTimes(1);
      expect(shell.which).toHaveBeenCalledWith('git');
      expect(environmentUtils.get).toHaveBeenCalledTimes(1);
      expect(environmentUtils.get).toHaveBeenCalledWith(
        variable,
        undefined
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(0);
    });
  });

  it('should fail to create the revision file because it can\'t write the file', () => {
    // Given
    const variable = 'VERSION';
    const version = 'latest';
    const file = 'revision';
    const environmentUtils = {
      get: jest.fn(() => ''),
    };
    const appLogger = {
      error: jest.fn(),
    };
    const pathUtils = {
      join: jest.fn((filepath) => filepath),
    };
    const error = new Error('Unknown error');
    fs.statSync.mockImplementationOnce(() => true);
    fs.writeFile.mockImplementationOnce(() => Promise.reject(error));
    shell.which.mockImplementationOnce(() => true);
    shell.exec.mockImplementationOnce(() => ({
      code: 0,
      trim: () => version,
    }));
    let sut = null;
    // When
    sut = new VersionUtils(environmentUtils, appLogger, pathUtils);
    return sut.createRevisionFile(file, variable)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((resultError) => {
      // Then
      expect(resultError).toBe(error);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledTimes(1);
      expect(fs.statSync).toHaveBeenCalledWith('./.git');
      expect(shell.which).toHaveBeenCalledTimes(1);
      expect(shell.which).toHaveBeenCalledWith('git');
      expect(shell.exec).toHaveBeenCalledTimes(1);
      expect(shell.exec).toHaveBeenCalledWith('git rev-parse HEAD', { silent: true });
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(file);
      expect(environmentUtils.get).toHaveBeenCalledTimes(1);
      expect(environmentUtils.get).toHaveBeenCalledWith(
        variable,
        undefined
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(file, version);
    });
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
    versionUtils(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('versionUtils');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(VersionUtils);
    expect(sut.environmentUtils).toBe('environmentUtils');
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.pathUtils).toBe('pathUtils');
  });
});
