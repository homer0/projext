const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/configurationFile', () => ConfigurationFileMock);
jest.unmock('/src/services/configurations/projectConfiguration');

require('jasmine-expect');
const {
  ProjectConfiguration,
  projectConfiguration,
} = require('/src/services/configurations/projectConfiguration');

describe('services/configurations:projectConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    const pathUtils = 'pathUtils';
    const targetsFinder = 'targetsFinder';
    let sut = null;
    // When
    sut = new ProjectConfiguration(pathUtils, targetsFinder);
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
    expect(sut.targetsFinder).toBe(targetsFinder);
  });

  it('should return the project configuration', () => {
    // Given
    const pathUtils = 'pathUtils';
    const targetsFinder = jest.fn(() => []);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'others',
    ];
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, targetsFinder);
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
  });

  it('should return the project configuration with targets found on the source directory', () => {
    // Given
    const pathUtils = 'pathUtils';
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
      'others',
    ];
    let sut = null;
    let result = null;
    const expectedTargets = {
      [targetOne.name]: targetOne,
      [targetTwo.name]: targetTwo,
    };
    // When
    sut = new ProjectConfiguration(pathUtils, targetsFinder);
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
    const pathUtils = 'pathUtils';
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
      'others',
    ];
    let sut = null;
    let result = null;
    const expectedTargets = {
      [target.name]: Object.assign({}, target, targetOverwrite),
    };
    // When
    sut = new ProjectConfiguration(pathUtils, targetsFinder);
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
    const pathUtils = 'pathUtils';
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
      'others',
    ];
    let sut = null;
    let result = null;
    const expectedTargets = {
      [targetOverwrite.name]: Object.assign({}, target, targetOverwrite),
    };
    // When
    sut = new ProjectConfiguration(pathUtils, targetsFinder);
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
    const pathUtils = 'pathUtils';
    const targetsFinder = jest.fn(() => []);
    const expectedKeys = [
      'paths',
      'targetsTemplates',
      'targets',
      'copy',
      'version',
      'others',
    ];
    let sut = null;
    let result = null;
    // When
    sut = new ProjectConfiguration(pathUtils, targetsFinder);
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
  });
});
