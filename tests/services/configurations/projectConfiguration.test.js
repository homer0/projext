const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/configurationFile', () => ConfigurationFileMock);
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
    let sut = null;
    // When
    sut = new ProjectConfiguration(pathUtils);
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'project.config.js'
    );
  });

  it('should return the project configuration', () => {
    // Given
    const pathUtils = 'pathUtils';
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
    sut = new ProjectConfiguration(pathUtils);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(ProjectConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      'project.config.js'
    );
    expect(result).toBeObject();
    expect(Object.keys(result)).toEqual(expectedKeys);
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
  });
});
