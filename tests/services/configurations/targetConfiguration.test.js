const JimpleMock = require('/tests/mocks/jimple.mock');
const ConfigurationFileMock = require('/tests/mocks/configurationFile.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/configurationFile', () => ConfigurationFileMock);
jest.unmock('/src/services/configurations/targetConfiguration');

require('jasmine-expect');
const {
  TargetConfiguration,
  targetConfiguration,
} = require('/src/services/configurations/targetConfiguration');

describe('services/configurations:targetConfiguration', () => {
  beforeEach(() => {
    ConfigurationFileMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    const overwritePath = 'targetFile';
    const baseConfiguration = 'baseConfiguration';
    const pathUtils = 'pathUtils';
    let sut = null;
    // When
    sut = new TargetConfiguration(overwritePath, baseConfiguration, pathUtils);
    // Then
    expect(sut).toBeInstanceOf(TargetConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      overwritePath,
      true,
      baseConfiguration
    );
  });

  it('should return an empty object when there\'s no configuration file', () => {
    // Given
    const overwritePath = 'targetFile';
    const baseConfiguration = 'baseConfiguration';
    const pathUtils = 'pathUtils';
    let sut = null;
    let result = null;
    // When
    sut = new TargetConfiguration(overwritePath, baseConfiguration, pathUtils);
    result = sut.getConfig();
    // Then
    expect(sut).toBeInstanceOf(TargetConfiguration);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.constructorMock).toHaveBeenCalledWith(
      pathUtils,
      overwritePath,
      true,
      baseConfiguration
    );
    expect(result).toEqual({});
  });

  it('should include a provider for the DIC', () => {
    // Given
    const overwritePath = 'targetFile';
    const baseConfiguration = 'baseConfiguration';
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    let provider = null;
    // When
    targetConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    provider = serviceFn();
    sut = provider(overwritePath, baseConfiguration);
    // Then
    expect(serviceName).toBe('targetConfiguration');
    expect(serviceFn).toBeFunction();
    expect(provider).toBeFunction();
    expect(sut).toBeInstanceOf(TargetConfiguration);
  });
});
