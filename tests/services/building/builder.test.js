const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/builder');

require('jasmine-expect');
const { Builder, builder } = require('/src/services/building/builder');

describe('services/building:builder', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = 'buildCopier';
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    // Then
    expect(sut).toBeInstanceOf(Builder);
    expect(sut.buildCleaner).toBe(buildCleaner);
    expect(sut.buildCopier).toBe(buildCopier);
    expect(sut.buildEngines).toBe(buildEngines);
    expect(sut.buildTranspiler).toBe(buildTranspiler);
    expect(sut.targets).toBe(targets);
  });

  it('should return the build command for a bundled target', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = 'buildCopier';
    const command = 'some-command';
    const engine = {
      getBuildCommand: jest.fn(() => command),
    };
    const buildEngines = {
      getEngine: jest.fn(() => engine),
    };
    const buildTranspiler = 'buildTranspiler';
    const targets = 'targets';
    const target = {
      bundle: true,
      engine: 'webpack',
    };
    const buildType = 'development';
    const forceRun = false;
    const forceWatch = false;
    let sut = null;
    let result = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    result = sut.getTargetBuildCommand(target, buildType);
    // Then
    expect(result).toBe(command);
    expect(buildEngines.getEngine).toHaveBeenCalledTimes(1);
    expect(buildEngines.getEngine).toHaveBeenCalledWith(target.engine);
    expect(engine.getBuildCommand).toHaveBeenCalledTimes(1);
    expect(engine.getBuildCommand).toHaveBeenCalledWith(
      target,
      buildType,
      forceRun,
      forceWatch
    );
  });

  it('should return the build command for a bundled target and force run', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = 'buildCopier';
    const command = 'some-command';
    const engine = {
      getBuildCommand: jest.fn(() => command),
    };
    const buildEngines = {
      getEngine: jest.fn(() => engine),
    };
    const buildTranspiler = 'buildTranspiler';
    const targets = 'targets';
    const target = {
      bundle: true,
      engine: 'webpack',
    };
    const buildType = 'development';
    const forceRun = true;
    const forceWatch = false;
    let sut = null;
    let result = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    result = sut.getTargetBuildCommand(target, buildType, forceRun);
    // Then
    expect(result).toBe(command);
    expect(buildEngines.getEngine).toHaveBeenCalledTimes(1);
    expect(buildEngines.getEngine).toHaveBeenCalledWith(target.engine);
    expect(engine.getBuildCommand).toHaveBeenCalledTimes(1);
    expect(engine.getBuildCommand).toHaveBeenCalledWith(
      target,
      buildType,
      forceRun,
      forceWatch
    );
  });

  it('should return the build command for a bundled target and force watch', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = 'buildCopier';
    const command = 'some-command';
    const engine = {
      getBuildCommand: jest.fn(() => command),
    };
    const buildEngines = {
      getEngine: jest.fn(() => engine),
    };
    const buildTranspiler = 'buildTranspiler';
    const targets = 'targets';
    const target = {
      bundle: true,
      engine: 'webpack',
    };
    const buildType = 'development';
    const forceRun = false;
    const forceWatch = true;
    let sut = null;
    let result = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    result = sut.getTargetBuildCommand(target, buildType, forceRun, forceWatch);
    // Then
    expect(result).toBe(command);
    expect(buildEngines.getEngine).toHaveBeenCalledTimes(1);
    expect(buildEngines.getEngine).toHaveBeenCalledWith(target.engine);
    expect(engine.getBuildCommand).toHaveBeenCalledTimes(1);
    expect(engine.getBuildCommand).toHaveBeenCalledWith(
      target,
      buildType,
      forceRun,
      forceWatch
    );
  });

  it('shouldn\'t return any command if the target doesn\'t need bundling', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = 'buildCopier';
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const targets = 'targets';
    const target = {
      bundle: false,
    };
    const buildType = 'development';
    let sut = null;
    let result = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    result = sut.getTargetBuildCommand(target, buildType);
    // Then
    expect(result).toBeEmptyString();
  });

  it('should copy a node target files if the build type is `production`', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = {
      copyTargetFiles: jest.fn(() => Promise.resolve()),
    };
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const target = {
      name: 'some-target',
      bundle: false,
      is: {
        node: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const buildType = 'production';
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    return sut.copyTarget(target.name, buildType)
    .then(() => {
      // Then
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(buildCopier.copyTargetFiles).toHaveBeenCalledTimes(1);
      expect(buildCopier.copyTargetFiles).toHaveBeenCalledWith(target);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should copy a node target files if target needs transpilation', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = {
      copyTargetFiles: jest.fn(() => Promise.resolve()),
    };
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const target = {
      name: 'some-target',
      bundle: false,
      transpile: true,
      is: {
        node: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const buildType = 'development';
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    return sut.copyTarget(target.name, buildType)
    .then(() => {
      // Then
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(buildCopier.copyTargetFiles).toHaveBeenCalledTimes(1);
      expect(buildCopier.copyTargetFiles).toHaveBeenCalledWith(target);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('shouldn\'t copy a node target files if the target requires bundling', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = {
      copyTargetFiles: jest.fn(() => Promise.resolve()),
    };
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const target = {
      name: 'some-target',
      bundle: true,
      is: {
        node: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const buildType = 'production';
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    return sut.copyTarget(target.name, buildType)
    .then(() => {
      // Then
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(buildCopier.copyTargetFiles).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('shouldn\'t copy a browser target files', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = {
      copyTargetFiles: jest.fn(() => Promise.resolve()),
    };
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const target = {
      name: 'some-target',
      is: {
        node: false,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const buildType = 'production';
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    return sut.copyTarget(target.name, buildType)
    .then(() => {
      // Then
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(buildCopier.copyTargetFiles).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should transpile a node target files', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = 'buildCopier';
    const buildEngines = 'buildEngines';
    const buildTranspiler = {
      transpileTargetFiles: jest.fn(() => Promise.resolve()),
    };
    const target = {
      name: 'some-target',
      bundle: false,
      transpile: true,
      is: {
        node: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const buildType = 'production';
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    return sut.transpileTarget(target.name, buildType)
    .then(() => {
      // Then
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(buildTranspiler.transpileTargetFiles).toHaveBeenCalledTimes(1);
      expect(buildTranspiler.transpileTargetFiles)
      .toHaveBeenCalledWith(target, buildType);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('shouldn\'t transpile a browser target files', () => {
    // Given
    const buildCleaner = 'buildCleaner';
    const buildCopier = 'buildCopier';
    const buildEngines = 'buildEngines';
    const buildTranspiler = {
      transpileTargetFiles: jest.fn(() => Promise.resolve()),
    };
    const target = {
      name: 'some-target',
      is: {
        node: false,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const buildType = 'production';
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    return sut.transpileTarget(target.name, buildType)
    .then(() => {
      // Then
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(buildTranspiler.transpileTargetFiles).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should clean a target files using the target name', () => {
    // Given
    const buildCleaner = {
      cleanTarget: jest.fn(),
    };
    const buildCopier = 'buildCopier';
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const target = {
      name: 'some-target',
      bundle: false,
      transpile: true,
      is: {
        node: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    sut.cleanTarget(target.name);
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target.name);
    expect(buildCleaner.cleanTarget).toHaveBeenCalledTimes(1);
    expect(buildCleaner.cleanTarget).toHaveBeenCalledWith(target);
  });

  it('should clean a target files using the target information', () => {
    // Given
    const buildCleaner = {
      cleanTarget: jest.fn(),
    };
    const buildCopier = 'buildCopier';
    const buildEngines = 'buildEngines';
    const buildTranspiler = 'buildTranspiler';
    const target = {
      name: 'some-target',
      bundle: false,
      transpile: true,
      is: {
        node: true,
      },
    };
    const targets = {
      getTarget: jest.fn(),
    };
    let sut = null;
    // When
    sut = new Builder(
      buildCleaner,
      buildCopier,
      buildEngines,
      buildTranspiler,
      targets
    );
    sut.cleanTarget(target);
    // Then
    expect(targets.getTarget).toHaveBeenCalledTimes(0);
    expect(buildCleaner.cleanTarget).toHaveBeenCalledTimes(1);
    expect(buildCleaner.cleanTarget).toHaveBeenCalledWith(target);
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
    builder(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('builder');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(Builder);
    expect(sut.buildCleaner).toBe('buildCleaner');
    expect(sut.buildCopier).toBe('buildCopier');
    expect(sut.buildEngines).toBe('buildEngines');
    expect(sut.buildTranspiler).toBe('buildTranspiler');
    expect(sut.targets).toBe('targets');
  });
});
