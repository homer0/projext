const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.mock('dotenv');
jest.mock('dotenv-expand');
jest.unmock('/src/services/common/dotEnvUtils');

require('jasmine-expect');
const fs = require('fs-extra');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const ObjectUtils = require('wootils/shared/objectUtils');

const {
  DotEnvUtils,
  dotEnvUtils,
} = require('/src/services/common/dotEnvUtils');

describe('services/common:dotEnvUtils', () => {
  it('should be instantiated', () => {
    // Given
    const environmentUtils = 'environmentUtils';
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    let sut = null;
    // When
    sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
    // Then
    expect(sut).toBeInstanceOf(DotEnvUtils);
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
      get: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    const expectedGets = [
      'environmentUtils',
      'appLogger',
      'pathUtils',
    ];
    // When
    dotEnvUtils(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('dotEnvUtils');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBeInstanceOf(DotEnvUtils);
    expect(container.get).toHaveBeenCalledTimes(expectedGets.length);
    expectedGets.forEach((expectedGet) => {
      expect(container.get).toHaveBeenCalledWith(expectedGet);
    });
  });

  describe('load', () => {
    beforeEach(() => {
      fs.pathExistsSync.mockReset();
      fs.readFileSync.mockReset();
      dotenv.parse.mockReset();
      dotenvExpand.mockReset();
    });

    it('shouldn\'t load anything if no files are provided', () => {
      // Given
      const environmentUtils = 'environmentUtils';
      const appLogger = 'appLogger';
      const pathUtils = 'pathUtils';
      let sut = null;
      let result = null;
      // When
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      result = sut.load([]);
      // Then
      expect(result).toEqual({
        loaded: false,
        variables: {},
      });
    });

    it('shouldn\'t load anything if the file doesn\'t exist', () => {
      // Given
      fs.pathExistsSync.mockReturnValueOnce(false);
      const environmentUtils = 'environmentUtils';
      const appLogger = 'appLogger';
      const pathUtils = {
        join: jest.fn((filepath) => filepath),
      };
      const file = '.env';
      let sut = null;
      let result = null;
      // When
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      result = sut.load([file]);
      // Then
      expect(result).toEqual({
        loaded: false,
        variables: {},
      });
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(file);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(file);
    });

    it('should fail to load the variables from an .env file', () => {
      // Given
      fs.pathExistsSync.mockReturnValueOnce(true);
      const error = new Error('Unexpected Error');
      fs.readFileSync.mockImplementationOnce(() => {
        throw error;
      });
      const environmentUtils = 'environmentUtils';
      const appLogger = {
        success: jest.fn(),
        error: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((filepath) => filepath),
      };
      const file = '.env';
      let sut = null;
      // When/Then
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      expect(() => sut.load([file])).toThrow(error.message);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(appLogger.error).toHaveBeenCalledWith(
        `Error: The environment file couldn't be read: ${file}`
      );
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(file);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(file);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith(file);
      expect(dotenv.parse).toHaveBeenCalledTimes(0);
      expect(dotenvExpand).toHaveBeenCalledTimes(0);
      expect(appLogger.success).toHaveBeenCalledTimes(0);
    });

    it('should load the variables from an .env file', () => {
      // Given
      fs.pathExistsSync.mockReturnValueOnce(true);
      const fileContents = {
        ROSARIO: 'Charito',
        PILAR: 'Pili',
      };
      fs.readFileSync.mockReturnValueOnce(fileContents);
      dotenv.parse.mockImplementationOnce((variables) => variables);
      dotenvExpand.mockImplementationOnce((config) => config);
      const environmentUtils = 'environmentUtils';
      const appLogger = {
        success: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((filepath) => filepath),
      };
      const file = '.env';
      let sut = null;
      let result = null;
      // When
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      result = sut.load([file]);
      // Then
      expect(result).toEqual({
        loaded: true,
        variables: fileContents,
      });
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(file);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(file);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith(file);
      expect(dotenv.parse).toHaveBeenCalledTimes(1);
      expect(dotenv.parse).toHaveBeenCalledWith(fileContents);
      expect(dotenvExpand).toHaveBeenCalledTimes(1);
      expect(dotenvExpand).toHaveBeenCalledWith({
        parsed: fileContents,
      });
      expect(appLogger.success).toHaveBeenCalledTimes(1);
      expect(appLogger.success).toHaveBeenCalledWith(
        `Environment file successfully loaded: ${file}`
      );
    });

    it('should load and merge the variables from multiple .env files', () => {
      // Given
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.pathExistsSync.mockReturnValueOnce(true);
      const firstFile = '.envOne';
      const firstFileContents = {
        ROSARIO: 'Charito',
        PILAR: 'Pili',
      };
      const secondFile = '.envTwo';
      const secondFileContents = {
        PILAR: 'Pili!',
        MONSTRO: 'UAAA',
      };
      fs.readFileSync.mockReturnValueOnce(firstFileContents);
      fs.readFileSync.mockReturnValueOnce(secondFileContents);
      dotenv.parse.mockImplementationOnce((variables) => variables);
      dotenv.parse.mockImplementationOnce((variables) => variables);
      dotenvExpand.mockImplementationOnce((config) => config);
      const environmentUtils = 'environmentUtils';
      const appLogger = {
        success: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((filepath) => filepath),
      };
      const files = [firstFile, secondFile];
      let sut = null;
      let result = null;
      const expectedMerge = ObjectUtils.merge(firstFileContents, secondFileContents);
      // When
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      result = sut.load(files);
      // Then
      expect(result).toEqual({
        loaded: true,
        variables: expectedMerge,
      });
      expect(pathUtils.join).toHaveBeenCalledTimes(files.length);
      expect(pathUtils.join).toHaveBeenCalledWith(firstFile);
      expect(pathUtils.join).toHaveBeenCalledWith(secondFile);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(files.length);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(firstFile);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(secondFile);
      expect(fs.readFileSync).toHaveBeenCalledTimes(files.length);
      expect(fs.readFileSync).toHaveBeenCalledWith(firstFile);
      expect(fs.readFileSync).toHaveBeenCalledWith(secondFile);
      expect(dotenv.parse).toHaveBeenCalledTimes(files.length);
      expect(dotenv.parse).toHaveBeenCalledWith(firstFileContents);
      expect(dotenv.parse).toHaveBeenCalledWith(secondFileContents);
      expect(appLogger.success).toHaveBeenCalledTimes(files.length);
      expect(appLogger.success).toHaveBeenCalledWith(
        `Environment file successfully loaded: ${firstFile}`
      );
      expect(appLogger.success).toHaveBeenCalledWith(
        `Environment file successfully loaded: ${secondFile}`
      );
      expect(dotenvExpand).toHaveBeenCalledTimes(1);
      expect(dotenvExpand).toHaveBeenCalledWith({
        parsed: expectedMerge,
      });
    });

    it('should load the variables from the first .env file it finds', () => {
      // Given
      fs.pathExistsSync.mockReturnValueOnce(true);
      fs.pathExistsSync.mockReturnValueOnce(true);
      const firstFile = '.envOne';
      const firstFileContents = {
        ROSARIO: 'Charito',
        PILAR: 'Pili',
      };
      const secondFile = '.envTwo';
      fs.readFileSync.mockReturnValueOnce(firstFileContents);
      dotenv.parse.mockImplementationOnce((variables) => variables);
      dotenvExpand.mockImplementationOnce((config) => config);
      const environmentUtils = 'environmentUtils';
      const appLogger = {
        success: jest.fn(),
      };
      const pathUtils = {
        join: jest.fn((filepath) => filepath),
      };
      const files = [firstFile, secondFile];
      let sut = null;
      let result = null;
      // When
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      result = sut.load(files, false);
      // Then
      expect(result).toEqual({
        loaded: true,
        variables: firstFileContents,
      });
      expect(pathUtils.join).toHaveBeenCalledTimes(files.length);
      expect(pathUtils.join).toHaveBeenCalledWith(firstFile);
      expect(pathUtils.join).toHaveBeenCalledWith(secondFile);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(files.length);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(firstFile);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(secondFile);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith(firstFile);
      expect(dotenv.parse).toHaveBeenCalledTimes(1);
      expect(dotenv.parse).toHaveBeenCalledWith(firstFileContents);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
      expect(appLogger.success).toHaveBeenCalledWith(
        `Environment file successfully loaded: ${firstFile}`
      );
      expect(dotenvExpand).toHaveBeenCalledTimes(1);
      expect(dotenvExpand).toHaveBeenCalledWith({
        parsed: firstFileContents,
      });
    });
  });

  describe('inject', () => {
    it('should inject variables into the environment', () => {
      // Given
      const environmentUtils = {
        set: jest.fn(),
      };
      const appLogger = 'appLogger';
      const pathUtils = 'pathUtils';
      const firstVariableName = 'ROSARIO';
      const firstVariableValue = 'Charito';
      const secondVariableName = 'PILAR';
      const secondVariableValue = 'Pili';
      let sut = null;
      // When
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      sut.inject({
        [firstVariableName]: firstVariableValue,
        [secondVariableName]: secondVariableValue,
      });
      // Then
      expect(environmentUtils.set).toHaveBeenCalledTimes(2);
      expect(environmentUtils.set).toHaveBeenCalledWith(
        firstVariableName,
        firstVariableValue,
        true
      );
      expect(environmentUtils.set).toHaveBeenCalledWith(
        secondVariableName,
        secondVariableValue,
        true
      );
    });

    it('should inject variables into the environment without overwriting existing ones', () => {
      // Given
      const environmentUtils = {
        set: jest.fn(),
      };
      const appLogger = 'appLogger';
      const pathUtils = 'pathUtils';
      const firstVariableName = 'ROSARIO';
      const firstVariableValue = 'Charito';
      const secondVariableName = 'PILAR';
      const secondVariableValue = 'Pili';
      let sut = null;
      // When
      sut = new DotEnvUtils(environmentUtils, appLogger, pathUtils);
      sut.inject(
        {
          [firstVariableName]: firstVariableValue,
          [secondVariableName]: secondVariableValue,
        },
        false
      );
      // Then
      expect(environmentUtils.set).toHaveBeenCalledTimes(2);
      expect(environmentUtils.set).toHaveBeenCalledWith(
        firstVariableName,
        firstVariableValue,
        false
      );
      expect(environmentUtils.set).toHaveBeenCalledWith(
        secondVariableName,
        secondVariableValue,
        false
      );
    });
  });
});
