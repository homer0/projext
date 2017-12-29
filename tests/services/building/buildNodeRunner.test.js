const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/buildNodeRunner');

require('jasmine-expect');
const {
  BuildNodeRunner,
  buildNodeRunner,
} = require('/src/services/building/buildNodeRunner');

describe('services/building:buildNodeRunner', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildNodeRunnerProcess = 'buildNodeRunnerProcess';
    let sut = null;
    // When
    sut = new BuildNodeRunner(buildNodeRunnerProcess);
    // Then
    expect(sut).toBeInstanceOf(BuildNodeRunner);
    expect(sut.buildNodeRunnerProcess).toBe(buildNodeRunnerProcess);
  });

  it('should throw an error when called with a target that requires bundling', () => {
    // Given
    const buildNodeRunnerProcess = 'buildNodeRunnerProcess';
    const target = {
      bundle: true,
    };
    let sut = null;
    // When
    sut = new BuildNodeRunner(buildNodeRunnerProcess);
    // Then
    expect(() => sut.runTarget(target)).toThrow(/needs to be bundled/i);
  });

  it('should run a target without transpilation', () => {
    // Given
    const buildNodeRunnerProcess = jest.fn();
    const target = {
      bundle: false,
      transpile: false,
      paths: {
        source: 'target-source-path',
      },
      entry: {
        development: 'index.development',
      },
    };
    let sut = null;
    // When
    sut = new BuildNodeRunner(buildNodeRunnerProcess);
    sut.runTarget(target);
    // Then
    expect(buildNodeRunnerProcess).toHaveBeenCalledTimes(1);
    expect(buildNodeRunnerProcess).toHaveBeenCalledWith(
      `${target.paths.source}/${target.entry.development}`,
      [target.paths.source],
      target.paths.source,
      target.paths.source,
      {}
    );
  });

  it('should run a target with transpilation', () => {
    // Given
    const buildNodeRunnerProcess = jest.fn();
    const target = {
      bundle: false,
      transpile: true,
      paths: {
        source: 'target-source-path',
        build: 'target-build-path',
      },
      entry: {
        development: 'index.development',
      },
    };
    let sut = null;
    // When
    sut = new BuildNodeRunner(buildNodeRunnerProcess);
    sut.runTarget(target);
    // Then
    expect(buildNodeRunnerProcess).toHaveBeenCalledTimes(1);
    expect(buildNodeRunnerProcess).toHaveBeenCalledWith(
      `${target.paths.build}/${target.entry.development}`,
      [target.paths.build],
      target.paths.source,
      target.paths.build,
      {}
    );
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
    buildNodeRunner(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildNodeRunner');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildNodeRunner);
    expect(sut.buildNodeRunnerProcess).toBe('buildNodeRunnerProcess');
  });
});
