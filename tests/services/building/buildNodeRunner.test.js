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
    const targets = 'targets';
    let sut = null;
    // When
    sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
    // Then
    expect(sut).toBeInstanceOf(BuildNodeRunner);
    expect(sut.buildNodeRunnerProcess).toBe(buildNodeRunnerProcess);
    expect(sut.targets).toBe(targets);
  });

  it('should throw an error when called with a target that requires bundling', () => {
    // Given
    const buildNodeRunnerProcess = 'buildNodeRunnerProcess';
    const targets = 'targets';
    const target = {
      bundle: true,
    };
    let sut = null;
    // When
    sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
    // Then
    expect(() => sut.runTarget(target)).toThrow(/needs to be bundled/i);
  });

  describe('without transpilation', () => {
    it('should run a target', () => {
      // Given
      const buildNodeRunnerProcess = jest.fn();
      const targets = 'targets';
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        includeTargets: [],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess).toHaveBeenCalledWith(
        `${target.paths.source}/${target.entry.development}`,
        [target.paths.source]
      );
    });

    it('should run a target and watch another target source directory', () => {
      // Given
      const buildNodeRunnerProcess = jest.fn();
      const includedTarget = {
        name: 'included-target',
        paths: {
          source: 'included-target-source-path',
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
        },
        entry: {
          development: 'index.development',
        },
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess).toHaveBeenCalledWith(
        `${target.paths.source}/${target.entry.development}`,
        [
          target.paths.source,
          includedTarget.paths.source,
        ]
      );
    });

    it('should throw an error when an included target requires bundling', () => {
      // Given
      const buildNodeRunnerProcess = jest.fn();
      const includedTarget = {
        name: 'included-target',
        bundle: true,
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When/Then
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      expect(() => sut.runTarget(target)).toThrow(/requires bundling/i);
    });

    it('should throw an error when an included target requires transpilation', () => {
      // Given
      const buildNodeRunnerProcess = jest.fn();
      const includedTarget = {
        name: 'included-target',
        transpile: true,
      };
      const targets = {
        getTarget: jest.fn(() => includedTarget),
      };
      const target = {
        bundle: false,
        transpile: false,
        paths: {
          source: 'target-source-path',
        },
        entry: {
          development: 'index.development',
        },
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When/Then
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      expect(() => sut.runTarget(target)).toThrow(/requires transpilation/i);
    });
  });

  describe('with transpilation', () => {
    it('should run a target', () => {
      // Given
      const buildNodeRunnerProcess = jest.fn();
      const targets = 'targets';
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
        includeTargets: [],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`,
        [target.paths.build],
        [{
          from: target.paths.source,
          to: target.paths.build,
        }],
        []
      );
    });

    it('should run a target and watch an included target that also requires transpilation', () => {
      // Given
      const buildNodeRunnerProcess = jest.fn();
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
        transpile: true,
        paths: {
          source: 'target-source-path',
          build: 'target-build-path',
        },
        entry: {
          development: 'index.development',
        },
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`,
        [
          target.paths.build,
          includedTarget.paths.build,
        ],
        [
          {
            from: target.paths.source,
            to: target.paths.build,
          },
          {
            from: includedTarget.paths.source,
            to: includedTarget.paths.build,
          },
        ],
        []
      );
    });

    it('should run a target and watch an included target that doesn\'t requires transp.', () => {
      // Given
      const buildNodeRunnerProcess = jest.fn();
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
        entry: {
          development: 'index.development',
        },
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      sut.runTarget(target);
      // Then
      expect(buildNodeRunnerProcess).toHaveBeenCalledTimes(1);
      expect(buildNodeRunnerProcess).toHaveBeenCalledWith(
        `${target.paths.build}/${target.entry.development}`,
        [
          target.paths.build,
          includedTarget.paths.build,
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
      const buildNodeRunnerProcess = jest.fn();
      const includedTarget = {
        name: 'included-target',
        bundle: true,
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
        entry: {
          development: 'index.development',
        },
        includeTargets: [includedTarget.name],
      };
      let sut = null;
      // When/Then
      sut = new BuildNodeRunner(buildNodeRunnerProcess, targets);
      expect(() => sut.runTarget(target)).toThrow(/requires bundling/i);
    });
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
    expect(sut.targets).toBe('targets');
  });
});
