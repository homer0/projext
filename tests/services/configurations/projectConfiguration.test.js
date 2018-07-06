const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.mock('fs-extra');
jest.unmock('/src/services/configurations/projectConfiguration');

const fs = require('fs-extra');
require('jasmine-expect');
const {
  ProjectConfiguration,
  projectConfiguration,
} = require('/src/services/configurations/projectConfiguration');

describe('services/configurations:projectConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
    fs.pathExistsSync.mockReset();
  });

  it('should be instantiated', () => {
    // Given
    const pathUtils = 'pathUtils';
    const plugins = 'plugins';
    const targetsFinder = 'targetsFinder';
    let sut = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(sut.plugins).toBe(plugins);
    expect(sut.targetsFinder).toBe(targetsFinder);
  });

  it('should return the project configuration', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
    };
    const targetsFinder = jest.fn(() => []);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(targetsFinder).toHaveBeenCalledTimes(1);
    expect(targetsFinder).toHaveBeenCalledWith(result.paths.source);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(2);
    expect(fs.pathExistsSync).toHaveBeenCalledWith('projext.plugin.js');
    expect(fs.pathExistsSync).toHaveBeenCalledWith('config/projext.plugin.js');
    expect(pathUtils.join).toHaveBeenCalledTimes(2);
    expect(pathUtils.join).toHaveBeenCalledWith('projext.plugin.js');
    expect(pathUtils.join).toHaveBeenCalledWith('config/projext.plugin.js');
  });

  it('should return the project configuration and use `webpack` as build engine', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugin = 'webpack';
    const plugins = {
      loaded: jest.fn((name) => (name === plugin)),
    };
    const targetsFinder = jest.fn(() => []);
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(result.targetsTemplates.node.engine).toBe(plugin);
    expect(result.targetsTemplates.browser.engine).toBe(plugin);
  });

  it('should return the project configuration and use `Rollup` as build engine', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugin = 'rollup';
    const plugins = {
      loaded: jest.fn((name) => (name === plugin)),
    };
    const targetsFinder = jest.fn(() => []);
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(result.targetsTemplates.node.engine).toBe(plugin);
    expect(result.targetsTemplates.browser.engine).toBe(plugin);
  });

  it('should return the project configuration with targets found on the source directory', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
    };
    const targetOne = {
      name: 'targetOne',
      type: 'node',
    };
    const targetTwo = {
      name: 'targetTwo',
      type: 'browser',
    };
    const targets = [targetOne, targetTwo];
    const targetsFinder = jest.fn(() => targets);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    const expectedTargets = {
      [targetOne.name]: targetOne,
      [targetTwo.name]: targetTwo,
    };
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(result.targets).toEqual(expectedTargets);
    expect(targetsFinder).toHaveBeenCalledTimes(1);
    expect(targetsFinder).toHaveBeenCalledWith(result.paths.source);
  });

  it('should overwrite any found target information', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
    };
    const target = {
      name: 'myApp',
      type: 'browser',
      framework: 'react',
    };
    const targetOverwrite = {
      framework: 'aurelia',
    };
    ConfigurationFileMock.overwrite({
      targets: {
        [target.name]: targetOverwrite,
      },
    });
    const targetsFinder = jest.fn(() => [target]);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    const expectedTargets = {
      [target.name]: Object.assign({}, target, targetOverwrite),
    };
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(result.targets).toEqual(expectedTargets);
    expect(targetsFinder).toHaveBeenCalledTimes(1);
    expect(targetsFinder).toHaveBeenCalledWith(result.paths.source);
  });

  it('should rename a target if it only found one and the configuration also has only one', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
    };
    const target = {
      name: 'myApp',
      type: 'browser',
      framework: 'react',
    };
    const targetOverwrite = {
      name: 'myAppNewName',
      framework: 'aurelia',
    };
    ConfigurationFileMock.overwrite({
      targets: {
        [targetOverwrite.name]: targetOverwrite,
      },
    });
    const targetsFinder = jest.fn(() => [target]);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    const expectedTargets = {
      [targetOverwrite.name]: Object.assign({}, target, targetOverwrite),
    };
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(result.targets).toEqual(expectedTargets);
    expect(targetsFinder).toHaveBeenCalledTimes(1);
    expect(targetsFinder).toHaveBeenCalledWith(result.paths.source);
  });

  it('shouldn\'t search for targets if the overwrites disable the targets finder', () => {
    // Given
    ConfigurationFileMock.overwrite({
      others: {
        findTargets: {
          enabled: false,
        },
      },
    });
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
    };
    const targetsFinder = jest.fn(() => []);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(result.targets).toEqual({});
    expect(targetsFinder).toHaveBeenCalledTimes(0);
  });

  it('should load a plugin which file was specified on the configuration', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
      loadFromFile: jest.fn(),
    };
    const pluginFile = 'my-plugin.js';
    ConfigurationFileMock.overwrite({
      plugins: {
        list: [pluginFile],
      },
    });
    const targetsFinder = jest.fn(() => []);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(plugins.loadFromFile).toHaveBeenCalledTimes(1);
    expect(plugins.loadFromFile).toHaveBeenCalledWith(pluginFile);
  });

  it('shouldn\'t load custom plugins if the feature is disabled', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
      loadFromFile: jest.fn(),
    };
    const pluginFile = 'my-plugin.js';
    ConfigurationFileMock.overwrite({
      plugins: {
        enabled: false,
        list: [pluginFile],
      },
    });
    const targetsFinder = jest.fn(() => []);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(pathUtils.join).toHaveBeenCalledTimes(0);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(0);
    expect(plugins.loadFromFile).toHaveBeenCalledTimes(0);
  });

  it('should load the "known plugins"', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => true);
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const plugins = {
      loaded: jest.fn(() => false),
      loadFromFile: jest.fn(),
    };
    const targetsFinder = jest.fn(() => []);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'plugins',
      'others',
    ];
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, plugins, targetsFinder);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      [
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ]
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
    expect(plugins.loadFromFile).toHaveBeenCalledTimes(2);
    expect(plugins.loadFromFile).toHaveBeenCalledWith('projext.plugin.js');
    expect(plugins.loadFromFile).toHaveBeenCalledWith('config/projext.plugin.js');
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
    projectConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('projectConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.targetsFinder).toBe('targetsFinder');
    expect(sut.plugins).toBe('plugins');
  });
});
