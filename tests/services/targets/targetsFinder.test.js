const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/targets/targetsFinder');

require('jasmine-expect');

const fs = require('fs-extra');
const {
  TargetsFinder,
  targetsFinder,
} = require('/src/services/targets/targetsFinder');

describe('services/targets:targetsFinder', () => {
  beforeEach(() => {
    fs.pathExistsSync.mockReset();
    fs.readdirSync.mockReset();
    fs.lstatSync.mockReset();
    fs.readFileSync.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    let sut = null;
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    // Then
    expect(sut).toBeInstanceOf(TargetsFinder);
    expect(sut.packageInfo).toBe(packageInfo);
    expect(sut.pathUtils).toBe(pathUtils);
  });

  it('shouldn\'t find any target if the source directory doesn\'t exists', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    fs.pathExistsSync.mockReturnValueOnce(false);
    const directory = 'src';
    let sut = null;
    let result = null;
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toBeEmptyArray();
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
  });

  it('shouldn\'t find a target if the source directory is empty', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    fs.pathExistsSync.mockReturnValueOnce(true);
    const sourceDirectoryContents = ['..', '.'];
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toBeEmptyArray();
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
  });

  it('shouldn\'t find a target if there are no JS files or dirs on the source directory', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    fs.pathExistsSync.mockReturnValueOnce(true);
    const invalidFile = 'some-file.txt';
    const sourceDirectoryContents = ['..', '.', invalidFile];
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileStats = {
      isDirectory: jest.fn(() => false),
    };
    fs.lstatSync.mockReturnValueOnce(fileStats);
    const directory = 'src';
    let sut = null;
    let result = null;
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toBeEmptyArray();
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.lstatSync).toHaveBeenCalledTimes(1);
    expect(fs.lstatSync).toHaveBeenCalledWith(`${directory}/${invalidFile}`);
    expect(fileStats.isDirectory).toHaveBeenCalledTimes(1);
  });

  it('shouldn\'t find a target if there\'s not a valid entry file (index or index.[env])', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(false);
    const invalidFileOne = 'some-file.js';
    const invalidFileTwo = 'some-file-two.js';
    const sourceDirectoryContents = ['..', '.', invalidFileOne, invalidFileTwo];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toBeEmptyArray();
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(2);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/index.js`);
  });

  it('shouldn\'t find a sub target if there\'s not a valid entry file', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(false);
    const subTargetFolder = 'my-target';
    const sourceDirectoryContents = ['..', '.', subTargetFolder];
    const invalidFileOne = 'some-file.js';
    const invalidFileTwo = 'some-file-two.js';
    const subTargetContents = [invalidFileOne, invalidFileTwo];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(subTargetContents);
    const fileStats = {
      isDirectory: jest.fn(() => true),
    };
    fs.lstatSync.mockReturnValueOnce(fileStats);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedStatsCalls = [
      `${directory}/${subTargetFolder}`,
      `${directory}/${subTargetFolder}/${invalidFileOne}`,
      `${directory}/${subTargetFolder}/${invalidFileTwo}`,
    ];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toBeEmptyArray();
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(2);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${subTargetFolder}/index.js`);
    expect(fs.lstatSync).toHaveBeenCalledTimes(expectedStatsCalls.length);
    expectedStatsCalls.forEach((filepath) => {
      expect(fs.lstatSync).toHaveBeenCalledWith(filepath);
    });
    expect(fileStats.isDirectory).toHaveBeenCalledTimes(1);
  });

  it('shouldn\'t find a sub target if it has no JS files', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    fs.pathExistsSync.mockReturnValueOnce(true);
    const subTargetFolder = 'my-target';
    const sourceDirectoryContents = ['..', '.', subTargetFolder];
    const subTargetContents = ['..', '.'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(subTargetContents);
    const fileStats = {
      isDirectory: jest.fn(() => true),
    };
    fs.lstatSync.mockReturnValueOnce(fileStats);
    const directory = 'src';
    let sut = null;
    let result = null;
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toBeEmptyArray();
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.lstatSync).toHaveBeenCalledTimes(1);
    expect(fs.lstatSync).toHaveBeenCalledWith(`${directory}/${subTargetFolder}`);
    expect(fileStats.isDirectory).toHaveBeenCalledTimes(1);
  });

  it('should find a Node target', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'console.log(\'hello charito!\');';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a Node target that requires transpiling', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'import charito from \'charito!\';';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
      transpile: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a Node target that requires transpiling and uses flow', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = [
      '/**',
      ' * @projext',
      ' * flow: true',
      ' */',
      '',
      'import charito from \'charito!\';',
    ].join('\n');
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
      transpile: true,
      flow: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a Node target that uses flow and force transpiling', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = [
      '/**',
      ' * @projext',
      ' * flow: true',
      ' */',
      '',
      'const charito = require(\'charito!\');',
    ].join('\n');
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
      transpile: true,
      flow: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a Node target that requires bundling', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'import charito from \'charito.png\';';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
      bundle: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a Node target that requires bundling and uses flow', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = [
      '/**',
      ' * @projext',
      ' * flow: true',
      ' */',
      '',
      'import charito from \'charito.png\';',
    ].join('\n');
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
      bundle: true,
      flow: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a Node target with a single file', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the entry file exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const entryFile = 'charito.js';
    const sourceDirectoryContents = ['..', '.', entryFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'console.log(\'hello charito!\');';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: entryFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'entry'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${entryFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${entryFile}`, 'utf-8');
  });

  it('should find a Node target with environment based entry files', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the entry file exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const developmentEntryFile = 'index.development.js';
    const productionEntryFile = 'index.production.js';
    const sourceDirectoryContents = ['..', '.', developmentEntryFile, productionEntryFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'console.log(\'hello charito!\');';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: 'index.js',
        development: developmentEntryFile,
        production: productionEntryFile,
      },
      type: 'node',
      library: false,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'entry'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${productionEntryFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${productionEntryFile}`, 'utf-8');
  });

  it('should find a Node target if there\'s an index file', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the entry file exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const entryFile = 'index.jsx';
    const otherFile = 'something.js';
    const sourceDirectoryContents = ['..', '.', entryFile, otherFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'console.log(\'hello charito!\');';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: entryFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'entry'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${entryFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${entryFile}`, 'utf-8');
  });

  it('should find a library Node target', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'module.exports = \'hello charito!\';';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      output: {
        default: {
          js: '[target-name].js',
        },
        development: {
          js: '[target-name].js',
        },
      },
      type: 'node',
      library: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a library Node target that requires transpiling', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'export default Charito';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      output: {
        default: {
          js: '[target-name].js',
        },
        development: {
          js: '[target-name].js',
        },
      },
      type: 'node',
      library: true,
      transpile: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a library browser target', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'module.exports = () => document.querySelector(\'#app\').remove()';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      output: {
        default: {
          js: '[target-name].js',
        },
        development: {
          js: '[target-name].js',
        },
      },
      type: 'browser',
      library: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a browser target and read its projext comment', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = [
      '/**',
      ' * @projext',
      ' * type: browser',
      ' * library: true',
      ' * inv@lidSetting: nothing',
      ' */',
    ].join('\n');
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      output: {
        default: {
          js: '[target-name].js',
        },
        development: {
          js: '[target-name].js',
        },
      },
      type: 'browser',
      library: true,
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a Node target and a browser target', () => {
    // Given
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the node index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 3 - When checking if the browser index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const nodeTargetFolder = 'node';
    const browserTargetFolder = 'browser';
    const indexFile = 'index.js';
    const sourceDirectoryContents = [
      '..',
      '.',
      nodeTargetFolder,
      browserTargetFolder,
    ];
    const subTargetContents = [indexFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the Node target.
    fs.readdirSync.mockReturnValueOnce(subTargetContents);
    // 3 - When parsing the browser target.
    fs.readdirSync.mockReturnValueOnce(subTargetContents);
    const nodeTargetIndexContents = 'import fs from \'fs\'';
    const browserTargetIndexContents = 'document.getElementById(\'#app\')';
    // 1 - When reading the Node target index.
    fs.readFileSync.mockReturnValueOnce(nodeTargetIndexContents);
    // 2 - When reading the browser target index.
    fs.readFileSync.mockReturnValueOnce(browserTargetIndexContents);
    const fileStats = {
      isDirectory: jest.fn(() => true),
    };
    // 1 - When reading the node directory.
    fs.lstatSync.mockReturnValueOnce(fileStats);
    // 2 - When reading the browser directory.
    fs.lstatSync.mockReturnValueOnce(fileStats);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [
      {
        name: nodeTargetFolder,
        hasFolder: true,
        createFolder: true,
        entry: {
          default: indexFile,
          development: null,
          production: null,
        },
        type: 'node',
        library: false,
        transpile: true,
      },
      {
        name: browserTargetFolder,
        hasFolder: true,
        createFolder: true,
        entry: {
          default: indexFile,
          development: null,
          production: null,
        },
        type: 'browser',
        library: false,
      },
    ];
    const expectedFileReads = [
      `${directory}/${nodeTargetFolder}/${indexFile}`,
      `${directory}/${browserTargetFolder}/${indexFile}`,
    ];
    const expectedPathChecks = [
      directory,
      ...expectedFileReads,
    ];
    const expectedPathReads = [
      directory,
      `${directory}/${nodeTargetFolder}`,
      `${directory}/${browserTargetFolder}`,
    ];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(expectedPathChecks.length);
    expectedPathChecks.forEach((pathCheck) => {
      expect(fs.pathExistsSync).toHaveBeenCalledWith(pathCheck);
    });
    expect(fs.readdirSync).toHaveBeenCalledTimes(expectedPathReads.length);
    expectedPathReads.forEach((readedPath) => {
      expect(fs.readdirSync).toHaveBeenCalledWith(readedPath);
    });
    expect(fs.readFileSync).toHaveBeenCalledTimes(expectedFileReads.length);
    expectedFileReads.forEach((filepath) => {
      expect(fs.readFileSync).toHaveBeenCalledWith(filepath, 'utf-8');
    });
  });

  it('should find a Node target that uses TypeScript', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.ts';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'import charito from \'charito!\';';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
      transpile: true,
      typeScript: true,
      sourceMap: {
        development: true,
        production: true,
      },
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a browser target that uses TypeScript and React', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.tsx';
    const sourceDirectoryContents = ['..', '.', indexFile, 'some-other-file.js'];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'window.alert(\'Hello Charito!\');';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'browser',
      library: false,
      typeScript: true,
      framework: 'react',
      sourceMap: {
        development: true,
        production: true,
      },
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(['sourceDirectory', 'index'].length);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(directory);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${directory}/${indexFile}`);
    expect(fs.readdirSync).toHaveBeenCalledTimes(['sourceDirectory', 'parsingTarget'].length);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readdirSync).toHaveBeenCalledWith(directory);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(`${directory}/${indexFile}`, 'utf-8');
  });

  it('should find a browser target that uses Angular', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'import ngmodule from \'@angular/core\'';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'browser',
      library: false,
      framework: 'angular',
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
  });

  it('should find a browser target that uses React', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'import React from \'react\';';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'browser',
      library: false,
      framework: 'react',
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
  });

  it('should find a node target that uses React SSR', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'import React from \'react\';\n' +
      'import ReactDOM from \'react-dom/server\'';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'node',
      library: false,
      framework: 'react',
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
  });

  it('should find a browser target that uses AngularJS', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = 'import angular from \'angular\';';
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'browser',
      library: false,
      framework: 'angularjs',
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
  });

  it('should find a browser target that uses Aurelia', () => {
    // Given
    const packageInfo = {
      name: 'my-app',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    // 1 - When checking if the source directory exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    // 2 - When checking if the default index exists.
    fs.pathExistsSync.mockReturnValueOnce(true);
    const indexFile = 'index.js';
    const sourceDirectoryContents = ['..', '.', indexFile];
    // 1 - When reading the source directory.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    // 2 - When parsing the target.
    fs.readdirSync.mockReturnValueOnce(sourceDirectoryContents);
    const fileContents = `
      import { PLATFORM } from \'aurelia-pal\';

      export const configure = () => {};
    `.trim();
    fs.readFileSync.mockReturnValueOnce(fileContents);
    const directory = 'src';
    let sut = null;
    let result = null;
    const expectedTargets = [{
      name: packageInfo.name,
      hasFolder: false,
      createFolder: false,
      entry: {
        default: indexFile,
        development: null,
        production: null,
      },
      type: 'browser',
      library: false,
      framework: 'aurelia',
    }];
    // When
    sut = new TargetsFinder(packageInfo, pathUtils);
    result = sut.find(directory);
    // Then
    expect(result).toEqual(expectedTargets);
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    targetsFinder(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('targetsFinder');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBeFunction();
  });
});
