const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/buildEngines');

require('jasmine-expect');
const { BuildEngines, buildEngines } = require('/src/services/building/buildEngines');

describe('services/building:buildEngines', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const app = 'app';
    let sut = null;
    // When
    sut = new BuildEngines(app);
    // Then
    expect(sut).toBeInstanceOf(BuildEngines);
    expect(sut.app).toBe(app);
  });

  it('should return a build engine service', () => {
    // Given
    const engine = 'webpack';
    const app = {
      get: jest.fn((name) => name),
    };
    let sut = null;
    let result = null;
    // When
    sut = new BuildEngines(app);
    result = sut.getEngine(engine);
    // Then
    expect(result).toBe(`${engine}BuildEngine`);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    buildEngines(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildEngines');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildEngines);
    expect(sut.app).toEqual(container);
  });
});
