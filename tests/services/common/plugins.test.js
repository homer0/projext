const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/common/plugins');

require('jasmine-expect');
const path = require('path');
const { Plugins, plugins } = require('/src/services/common/plugins');

const mocksRelativePath = path.join(__dirname, '../../mocks');

describe('services/common:plugins', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const prefix = 'prefix';
    const app = 'app';
    const appLogger = 'appLogger';
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    let sut = null;
    // When
    sut = new Plugins(prefix, app, appLogger, packageInfo, pathUtils);
    // Then
    expect(sut).toBeInstanceOf(Plugins);
    expect(sut.prefix).toBe(prefix);
    expect(sut.app).toBe(app);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.packageInfo).toBe(packageInfo);
    expect(sut.pathUtils).toBe(pathUtils);
  });

  it('should load a plugin', () => {
    // Given
    const prefix = 'plugin-';
    const app = {
      register: jest.fn(),
    };
    const appLogger = 'appLogger';
    const pluginName = 'plugin-for-something';
    const packageInfo = {
      dependencies: {
        'jest-ex': 'latest',
        'webpack-node-utils': 'latest',
      },
      devDependencies: {
        [pluginName]: 'latest',
      },
    };
    const pathUtils = {
      join: jest.fn(() => `${mocksRelativePath}/mockPlugin.js`),
    };
    let sut = null;
    // When
    sut = new Plugins(prefix, app, appLogger, packageInfo, pathUtils);
    sut.load();
    // Then
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith('node_modules', pluginName);
    expect(app.register).toHaveBeenCalledTimes(1);
    expect(app.register).toHaveBeenCalledWith('plugin');
  });

  it('should fail to load a plugin', () => {
    // Given
    const prefix = 'plugin-';
    const app = 'app';
    const appLogger = {
      error: jest.fn(),
    };
    const pluginName = 'plugin-for-something';
    const packageInfo = {
      dependencies: {
        'jest-ex': 'latest',
        'webpack-node-utils': 'latest',
      },
      devDependencies: {
        [pluginName]: 'latest',
      },
    };
    const error = new Error('Unknown error');
    const pathUtils = {
      join: jest.fn(() => {
        throw error;
      }),
    };
    let sut = null;
    // When
    sut = new Plugins(prefix, app, appLogger, packageInfo, pathUtils);
    // Then
    expect(() => sut.load()).toThrow(error);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith('node_modules', pluginName);
    expect(appLogger.error).toHaveBeenCalledTimes(1);
    expect(appLogger.error)
    .toHaveBeenCalledWith(`The plugin ${pluginName} couldn't be loaded`);
  });

  it('should only search for plugins on the production dependencies', () => {
    // Given
    const prefix = 'plugin-';
    const app = 'app';
    const appLogger = 'appLogger';
    const pluginName = 'plugin-for-something';
    const packageInfo = {
      dependencies: {
        'jest-ex': 'latest',
        'webpack-node-utils': 'latest',
      },
      devDependencies: {
        [pluginName]: 'latest',
      },
    };
    const pathUtils = {
      join: jest.fn(() => `${mocksRelativePath}/mockPlugin.js`),
    };
    let sut = null;
    // When
    sut = new Plugins(prefix, app, appLogger, packageInfo, pathUtils);
    sut.load(true, false);
    // Then
    expect(pathUtils.join).toHaveBeenCalledTimes(0);
  });

  it('should only search for plugins on the development dependencies', () => {
    // Given
    const prefix = 'plugin-';
    const app = 'app';
    const appLogger = 'appLogger';
    const pluginName = 'plugin-for-something';
    const packageInfo = {
      dependencies: {
        'webpack-node-utils': 'latest',
        [pluginName]: 'latest',
      },
      devDependencies: {
        'jest-ex': 'latest',
      },
    };
    const pathUtils = {
      join: jest.fn(() => `${mocksRelativePath}/mockPlugin.js`),
    };
    let sut = null;
    // When
    sut = new Plugins(prefix, app, appLogger, packageInfo, pathUtils);
    sut.load(false, true);
    // Then
    expect(pathUtils.join).toHaveBeenCalledTimes(0);
  });

  it('should include a provider for the DIC', () => {
    // Given
    const prefix = 'prefix';
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let provider = null;
    let serviceName = null;
    let serviceFn = null;
    // When
    provider = plugins(prefix);
    provider(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('plugins');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(Plugins);
    expect(sut.prefix).toBe(prefix);
    expect(sut.app).toEqual(container);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.packageInfo).toBe('packageInfo');
    expect(sut.pathUtils).toBe('pathUtils');
  });
});
