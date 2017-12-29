const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('babel-core');
jest.mock('fs');
jest.mock('glob');
jest.mock('fs-extra');
jest.unmock('/src/services/building/buildTranspiler');

const path = require('path');
const babel = require('babel-core');
const glob = require('glob');
const fs = require('fs-extra');
require('jasmine-expect');
const {
  BuildTranspiler,
  buildTranspiler,
} = require('/src/services/building/buildTranspiler');

describe('services/building:buildTranspiler', () => {
  beforeEach(() => {
    fs.writeFile.mockReset();
    fs.writeFileSync.mockReset();
    babel.transformFile.mockReset();
    babel.transformFileSync.mockReset();
    glob.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const babelConfiguration = 'babelConfiguration';
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    // Then
    expect(sut).toBeInstanceOf(BuildTranspiler);
    expect(sut.babelConfiguration).toBe(babelConfiguration);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.targets).toBe(targets);
  });

  it('should transpile a target files', () => {
    // Given
    const code = 'module.exports = someFunction();';
    const files = [
      'fileA.js',
      'fileB.jsx',
    ];
    glob.mockImplementationOnce((pattern, options, fn) => {
      fn(null, files);
    });
    files.forEach(() => {
      babel.transformFile.mockImplementationOnce((from, options, fn) => {
        fn(null, { code });
      });
    });
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = {
      success: jest.fn(),
      info: jest.fn(),
    };
    const pathUtils = {
      path: 'some-path',
      join: jest.fn((...args) => path.join(...args)),
    };
    const projectConfiguration = {
      paths: {
        build: 'build-path',
      },
    };
    const targets = 'targets';
    const buildType = 'development';
    const target = {
      entry: {
        [buildType]: 'index.js',
      },
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    return sut.transpileTargetFiles(target, buildType)
    .then(() => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(
        projectConfiguration.paths.build,
        target.entry[buildType]
      );
      expect(glob).toHaveBeenCalledTimes(1);
      expect(glob).toHaveBeenCalledWith(
        '**/*.{js,jsx}',
        {
          cwd: projectConfiguration.paths.build,
        },
        expect.any(Function)
      );
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledTimes(1);
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledWith(target);
      expect(babel.transformFile).toHaveBeenCalledTimes(files.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(files.length);
      files.forEach((file) => {
        expect(babel.transformFile).toHaveBeenCalledWith(
          path.join(
            projectConfiguration.paths.build,
            file
          ),
          {},
          expect.any(Function)
        );
        expect(fs.writeFile).toHaveBeenCalledWith(
          path.join(
            projectConfiguration.paths.build,
            file
          ),
          code
        );
      });

      expect(appLogger.success).toHaveBeenCalledTimes(1);
      expect(appLogger.info).toHaveBeenCalledTimes(files.length);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to transpile a target files', () => {
    // Given
    const error = new Error('Unknown error');
    glob.mockImplementationOnce((pattern, options, fn) => {
      fn(error, []);
    });
    const babelConfiguration = 'babelConfiguration';
    const appLogger = {
      error: jest.fn(),
    };
    const pathUtils = {
      path: 'some-path',
      join: jest.fn((...args) => path.join(...args)),
    };
    const projectConfiguration = {
      paths: {
        build: 'build-path',
      },
    };
    const targets = 'targets';
    const buildType = 'development';
    const target = {
      entry: {
        [buildType]: 'index.js',
      },
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    return sut.transpileTargetFiles(target, buildType)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((errorResult) => {
      // Then
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(
        projectConfiguration.paths.build,
        target.entry[buildType]
      );
      expect(glob).toHaveBeenCalledTimes(1);
      expect(glob).toHaveBeenCalledWith(
        '**/*.{js,jsx}',
        {
          cwd: projectConfiguration.paths.build,
        },
        expect.any(Function)
      );

      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(errorResult).toBe(error);
    });
  });

  it('should transpile a file', () => {
    // Given
    const code = 'module.exports = something();';
    const file = 'someFile.js';
    babel.transformFile.mockImplementationOnce((from, options, fn) => {
      fn(null, { code });
    });
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const target = {
      name: 'some-target',
    };
    const targets = {
      findTargetForFile: jest.fn(() => target),
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    return sut.transpileFile(file)
    .then(() => {
      // Then
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledTimes(1);
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledWith(target);
      expect(babel.transformFile).toHaveBeenCalledTimes(1);
      expect(babel.transformFile).toHaveBeenCalledWith(
        file,
        {},
        expect.any(Function)
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(file, code);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should transpile a file to a different path', () => {
    // Given
    const code = 'module.exports = something();';
    const file = 'someFile.js';
    const newFile = 'someNewFile.js';
    babel.transformFile.mockImplementationOnce((from, options, fn) => {
      fn(null, { code });
    });
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const target = {
      name: 'some-target',
    };
    const targets = {
      findTargetForFile: jest.fn(() => target),
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    return sut.transpileFile({
      source: file,
      output: newFile,
    })
    .then(() => {
      // Then
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledTimes(1);
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledWith(target);
      expect(babel.transformFile).toHaveBeenCalledTimes(1);
      expect(babel.transformFile).toHaveBeenCalledWith(
        file,
        {},
        expect.any(Function)
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(newFile, code);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should transpile a file and return the code instead of writing it', () => {
    // Given
    const code = 'module.exports = something();';
    const file = 'someFile.js';
    babel.transformFile.mockImplementationOnce((from, options, fn) => {
      fn(null, { code });
    });
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const target = {
      name: 'some-target',
    };
    const targets = {
      findTargetForFile: jest.fn(() => target),
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    return sut.transpileFile(file, {}, false)
    .then((result) => {
      // Then
      expect(result).toEqual({
        filepath: file,
        code,
      });
      expect(babel.transformFile).toHaveBeenCalledTimes(1);
      expect(babel.transformFile).toHaveBeenCalledWith(
        file,
        {},
        expect.any(Function)
      );
      expect(fs.writeFile).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to transpile a file', () => {
    // Given
    const file = 'someFile.js';
    const error = new Error('Unknown error');
    babel.transformFile.mockImplementationOnce((from, options, fn) => {
      fn(error, null);
    });
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const target = {
      name: 'some-target',
    };
    const targets = {
      findTargetForFile: jest.fn(() => target),
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    return sut.transpileFile(file)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((resultError) => {
      // Then
      expect(resultError).toBe(error);
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledTimes(1);
      expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledWith(target);
      expect(babel.transformFile).toHaveBeenCalledTimes(1);
      expect(babel.transformFile).toHaveBeenCalledWith(
        file,
        {},
        expect.any(Function)
      );
    });
  });

  it('should transpile a file (sync)', () => {
    // Given
    const code = 'module.exports = something();';
    const file = 'someFile.js';
    babel.transformFileSync.mockImplementationOnce(() => ({ code }));
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const target = {
      name: 'some-target',
    };
    const targets = {
      findTargetForFile: jest.fn(() => target),
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    sut.transpileFileSync(file);
    // Then
    expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledTimes(1);
    expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledWith(target);
    expect(babel.transformFileSync).toHaveBeenCalledTimes(1);
    expect(babel.transformFileSync).toHaveBeenCalledWith(file, {});
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(file, code);
  });

  it('should transpile a file to a different path (sync)', () => {
    // Given
    const code = 'module.exports = something();';
    const file = 'someFile.js';
    const newFile = 'someNewFile.js';
    babel.transformFileSync.mockImplementationOnce(() => ({ code }));
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const target = {
      name: 'some-target',
    };
    const targets = {
      findTargetForFile: jest.fn(() => target),
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    sut.transpileFileSync({
      source: file,
      output: newFile,
    });
    // Then
    expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledTimes(1);
    expect(babelConfiguration.getConfigForTarget).toHaveBeenCalledWith(target);
    expect(babel.transformFileSync).toHaveBeenCalledTimes(1);
    expect(babel.transformFileSync).toHaveBeenCalledWith(file, {});
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(newFile, code);
  });

  it('should transpile a file and return the code instead of writing it (sync)', () => {
    // Given
    const code = 'module.exports = something();';
    const file = 'someFile.js';
    babel.transformFileSync.mockImplementationOnce(() => ({ code }));
    const babelConfiguration = {
      getConfigForTarget: jest.fn(() => ({})),
    };
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const target = {
      name: 'some-target',
    };
    const targets = {
      findTargetForFile: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    result = sut.transpileFileSync(file, {}, false);
    // Then
    expect(result).toEqual({
      filepath: file,
      code,
    });
    expect(babel.transformFileSync).toHaveBeenCalledTimes(1);
    expect(babel.transformFileSync).toHaveBeenCalledWith(file, {});
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
  });

  it('should throw an error if it can\'t find a target for a file', () => {
    // Given
    const file = 'file.jsx';
    const babelConfiguration = 'babelConfiguration';
    const appLogger = 'appLogger';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const targets = {
      findTargetForFile: jest.fn(),
    };
    let sut = null;
    // When
    sut = new BuildTranspiler(
      babelConfiguration,
      appLogger,
      pathUtils,
      projectConfiguration,
      targets
    );
    // Then
    expect(() => sut.getTargetConfigurationForFile(file))
    .toThrow(/A target couldn't be find/i);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => service } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    buildTranspiler(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildTranspiler');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildTranspiler);
    expect(sut.babelConfiguration).toBe('babelConfiguration');
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
    expect(sut.targets).toBe('targets');
  });
});
