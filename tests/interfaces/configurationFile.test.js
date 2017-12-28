jest.mock('fs-extra');
jest.unmock('/src/interfaces/configurationFile');

require('jasmine-expect');
const fs = require('fs-extra');
const path = require('path');
const ConfigurationFile = require('/src/interfaces/configurationFile');
const mockObjectConfig = require('/tests/mocks/mockObject.config');
const mockFunctionConfig = require('/tests/mocks/mockFunction.config');

const mocksRelativePath = path.join(__dirname, '../mocks');

describe('interfaces:ConfigurationFile', () => {
  it('should throw an error if used without subclassing it', () => {
    // Given/When/Then
    expect(() => new ConfigurationFile())
    .toThrow(/ConfigurationFile is an abstract class/i);
  });

  it('should be able to be instantiated when subclassed', () => {
    // Given
    class Sut extends ConfigurationFile {}
    let sut = null;
    // When
    sut = new Sut();
    // Then
    expect(sut).toBeInstanceOf(Sut);
    expect(sut).toBeInstanceOf(ConfigurationFile);
  });

  it('should throw an error if the `createConfig` method is not overwritten', () => {
    // Given
    class Sut extends ConfigurationFile {}
    let sut = null;
    // When/Then
    sut = new Sut();
    expect(() => sut.createConfig()).toThrow(/This method must to be overwritten/i);
  });

  it('should create the config only the first time `getConfig` is called', () => {
    // Given
    const argOne = 'c';
    const argTwo = 'd';
    const pathUtils = {
      join: jest.fn(() => ''),
    };
    fs.pathExistsSync.mockReturnValueOnce(false);
    class Sut extends ConfigurationFile {}
    const createConfig = jest.fn((a, b) => ({ a, b }));
    const expectedConfig = {
      a: argOne,
      b: argTwo,
    };
    let sut = null;
    let firstCall = null;
    let secondCall = null;
    // When
    sut = new Sut(pathUtils);
    sut.createConfig = createConfig;
    firstCall = sut.getConfig(argOne, argTwo);
    secondCall = sut.getConfig();
    // Then
    expect(createConfig).toHaveBeenCalledTimes(1);
    expect(createConfig).toHaveBeenCalledWith(argOne, argTwo);
    expect(firstCall).toEqual(expectedConfig);
    expect(secondCall).toEqual(expectedConfig);
  });

  it('should create the config on every `getConfig` when instantiated as factory', () => {
    // Given
    const argOne = 'c';
    const argTwo = 'd';
    const pathUtils = {
      join: jest.fn(() => ''),
    };
    fs.pathExistsSync.mockReturnValueOnce(false);
    class Sut extends ConfigurationFile {}
    const createConfig = jest.fn((a, b) => ({ a, b }));
    const expectedFirstConfig = {
      a: argOne,
      b: argTwo,
    };
    const expectedSecondConfig = {
      a: argTwo,
      b: argOne,
    };
    let sut = null;
    let firstCall = null;
    let secondCall = null;
    // When
    sut = new Sut(pathUtils, '', true);
    sut.createConfig = createConfig;
    firstCall = sut.getConfig(argOne, argTwo);
    secondCall = sut.getConfig(argTwo, argOne);
    // Then
    expect(createConfig).toHaveBeenCalledTimes(2);
    expect(createConfig).toHaveBeenCalledWith(argOne, argTwo);
    expect(firstCall).toEqual(expectedFirstConfig);
    expect(secondCall).toEqual(expectedSecondConfig);
  });

  it('should be able to extend another instance of `ConfigurationFile`', () => {
    // Given
    const argOne = 'c';
    const argTwo = 'd';
    const pathUtils = {
      join: jest.fn(() => ''),
    };
    fs.pathExistsSync.mockReturnValueOnce(false);
    fs.pathExistsSync.mockReturnValueOnce(false);
    class Parent extends ConfigurationFile {}
    const createParentConfig = jest.fn((a, b) => ({ parent: { a, b } }));
    class Sut extends ConfigurationFile {}
    const createConfig = jest.fn((a, b) => ({ a, b }));
    const expectedFirstConfig = {
      a: argOne,
      b: argTwo,
      parent: {
        a: argOne,
        b: argTwo,
      },
    };
    let parentSut = null;
    let sut = null;
    let result = null;
    // When
    parentSut = new Parent(pathUtils, '');
    parentSut.createConfig = createParentConfig;
    sut = new Sut(pathUtils, '', false, parentSut);
    sut.createConfig = createConfig;
    result = sut.getConfig(argOne, argTwo);
    // Then
    expect(createConfig).toHaveBeenCalledTimes(1);
    expect(createConfig).toHaveBeenCalledWith(argOne, argTwo);
    expect(result).toEqual(expectedFirstConfig);
  });

  it('should overwrite the configuration using an object from a file', () => {
    // Given
    const argOne = 'c';
    const argTwo = 'd';
    const pathUtils = {
      join: jest.fn((folder, rest) => `${mocksRelativePath}/${rest}`),
    };
    fs.pathExistsSync.mockReturnValueOnce(true);
    class Sut extends ConfigurationFile {}
    const createConfig = jest.fn((a, b) => ({ a, b }));
    const expectedConfig = Object.assign({
      a: argOne,
      b: argTwo,
    }, mockObjectConfig);
    let sut = null;
    let firstCall = null;
    let secondCall = null;
    // When
    sut = new Sut(pathUtils, 'mockObject.config.js');
    sut.createConfig = createConfig;
    firstCall = sut.getConfig(argOne, argTwo);
    secondCall = sut.getConfig();
    // Then
    expect(createConfig).toHaveBeenCalledTimes(1);
    expect(createConfig).toHaveBeenCalledWith(argOne, argTwo);
    expect(firstCall).toEqual(expectedConfig);
    expect(secondCall).toEqual(expectedConfig);
  });

  it('should overwrite the configuration using a function from a file', () => {
    // Given
    const argOne = 'c';
    const argTwo = 'd';
    const pathUtils = {
      join: jest.fn((folder, rest) => `${mocksRelativePath}/${rest}`),
    };
    fs.pathExistsSync.mockReturnValueOnce(true);
    class Sut extends ConfigurationFile {}
    const createConfig = jest.fn((a, b) => ({ a, b }));
    const expectedConfig = Object.assign({
      a: argOne,
      b: argTwo,
    }, mockFunctionConfig(argOne, argTwo));
    let sut = null;
    let firstCall = null;
    let secondCall = null;
    // When
    sut = new Sut(pathUtils, 'mockFunction.config.js');
    sut.createConfig = createConfig;
    firstCall = sut.getConfig(argOne, argTwo);
    secondCall = sut.getConfig();
    // Then
    expect(createConfig).toHaveBeenCalledTimes(1);
    expect(createConfig).toHaveBeenCalledWith(argOne, argTwo);
    expect(firstCall).toEqual(expectedConfig);
    expect(secondCall).toEqual(expectedConfig);
  });
});
