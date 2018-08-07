const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/buildNodeWatcher');

require('jasmine-expect');
const {
  BuildNodeWatcher,
  buildNodeWatcher,
} = require('/src/services/building/buildNodeWatcher');

describe('services/building:buildNodeWatcher', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildNodeWatcherProcess = 'buildNodeWatcherProcess';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new BuildNodeWatcher(buildNodeWatcherProcess, targets);
    // Then
    expect(sut).toBeInstanceOf(BuildNodeWatcher);
    expect(sut.buildNodeWatcherProcess).toBe(buildNodeWatcherProcess);
    expect(sut.targets).toBe(targets);
  });

  it('should throw an error when called with a target that requires bundling', () => {
    // Given
    const buildNodeWatcherProcess = 'buildNodeWatcherProcess';
    const targets = 'targets';
    const target = {
      bundle: true,
    };
    let sut = null;
    // When
    sut = new BuildNodeWatcher(buildNodeWatcherProcess, targets);
    // Then
    expect(() => sut.watchTarget(target)).toThrow(/needs to be bundled/i);
  });

  it('should watch a target', () => {
    // Given
    const buildNodeWatcherProcess = jest.fn();
    const targets = 'targets';
    const target = {
      bundle: false,
      transpile: false,
      paths: {
        source: 'target-source-path',
        build: 'target-build-path',
      },
      includeTargets: [],
    };
    let sut = null;
    // When
    sut = new BuildNodeWatcher(buildNodeWatcherProcess, targets);
    sut.watchTarget(target);
    // Then
    expect(buildNodeWatcherProcess).toHaveBeenCalledTimes(1);
    expect(buildNodeWatcherProcess).toHaveBeenCalledWith(
      [target.paths.source],
      [],
      [{
        from: target.paths.source,
        to: target.paths.build,
      }]
    );
  });

  it('should watch a target that requires transpilation', () => {
    // Given
    const buildNodeWatcherProcess = jest.fn();
    const targets = 'targets';
    const target = {
      bundle: false,
      transpile: true,
      paths: {
        source: 'target-source-path',
        build: 'target-build-path',
      },
      includeTargets: [],
    };
    let sut = null;
    // When
    sut = new BuildNodeWatcher(buildNodeWatcherProcess, targets);
    sut.watchTarget(target);
    // Then
    expect(buildNodeWatcherProcess).toHaveBeenCalledTimes(1);
    expect(buildNodeWatcherProcess).toHaveBeenCalledWith(
      [target.paths.source],
      [{
        from: target.paths.source,
        to: target.paths.build,
      }],
      []
    );
  });

  it('should watch a target and include one that requires transpilation', () => {
    // Given
    const buildNodeWatcherProcess = jest.fn();
    const includedTarget = {
      name: 'included-target',
      transpile: true,
      paths: {
        source: 'included-target-source-path',
        build: 'included-target-build-path',
      },
    };
    const targets = {
      getTarget: jest.fn(() => includedTarget),
    };
    const target = {
      bundle: false,
      transpile: false,
      paths: {
        source: 'target-source-path',
        build: 'target-build-path',
      },
      includeTargets: [includedTarget.name],
    };
    let sut = null;
    // When
    sut = new BuildNodeWatcher(buildNodeWatcherProcess, targets);
    sut.watchTarget(target);
    // Then
    expect(buildNodeWatcherProcess).toHaveBeenCalledTimes(1);
    expect(buildNodeWatcherProcess).toHaveBeenCalledWith(
      [
        target.paths.source,
        includedTarget.paths.source,
      ],
      [{
        from: includedTarget.paths.source,
        to: includedTarget.paths.build,
      }],
      [{
        from: target.paths.source,
        to: target.paths.build,
      }]
    );
  });

  it('should watch a target and include one that doesn\'t requires transpilation', () => {
    // Given
    const buildNodeWatcherProcess = jest.fn();
    const includedTarget = {
      name: 'included-target',
      transpile: false,
      paths: {
        source: 'included-target-source-path',
        build: 'included-target-build-path',
      },
    };
    const targets = {
      getTarget: jest.fn(() => includedTarget),
    };
    const target = {
      bundle: false,
      transpile: true,
      paths: {
        source: 'target-source-path',
        build: 'target-build-path',
      },
      includeTargets: [includedTarget.name],
    };
    let sut = null;
    // When
    sut = new BuildNodeWatcher(buildNodeWatcherProcess, targets);
    sut.watchTarget(target);
    // Then
    expect(buildNodeWatcherProcess).toHaveBeenCalledTimes(1);
    expect(buildNodeWatcherProcess).toHaveBeenCalledWith(
      [
        target.paths.source,
        includedTarget.paths.source,
      ],
      [{
        from: target.paths.source,
        to: target.paths.build,
      }],
      [{
        from: includedTarget.paths.source,
        to: includedTarget.paths.build,
      }]
    );
  });

  it('should throw an error when an included target requires bundling', () => {
    // Given
    const buildNodeWatcherProcess = jest.fn();
    const includedTarget = {
      name: 'included-target',
      bundle: true,
      paths: {
        source: 'included-target-source-path',
        build: 'included-target-build-path',
      },
    };
    const targets = {
      getTarget: jest.fn(() => includedTarget),
    };
    const target = {
      bundle: false,
      transpile: true,
      paths: {
        source: 'target-source-path',
        build: 'target-build-path',
      },
      includeTargets: [includedTarget.name],
    };
    let sut = null;
    // When/Then
    sut = new BuildNodeWatcher(buildNodeWatcherProcess, targets);
    expect(() => sut.watchTarget(target)).toThrow(/requires bundling/i);
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
    buildNodeWatcher(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildNodeWatcher');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildNodeWatcher);
    expect(sut.buildNodeWatcherProcess).toBe('buildNodeWatcherProcess');
    expect(sut.targets).toBe('targets');
  });
});
