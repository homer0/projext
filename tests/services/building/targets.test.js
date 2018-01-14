const JimpleMock = require('/tests/mocks/jimple.mock');
const WootilsAppConfigurationMock = require('/tests/mocks/wootilsAppConfiguration.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('wootils/node/appConfiguration', () => ({
  AppConfiguration: WootilsAppConfigurationMock,
}));

jest.unmock('/src/services/building/targets');

const path = require('path');
require('jasmine-expect');
const { Targets, targets } = require('/src/services/building/targets');

describe('services/building:targets', () => {
  beforeEach(() => {
    WootilsAppConfigurationMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = 'rootRequire';
    let sut = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    // Then
    expect(sut).toBeInstanceOf(Targets);
    expect(sut.events).toBe(events);
    expect(sut.environmentUtils).toBe(environmentUtils);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.projectConfiguration).toEqual(projectConfiguration);
    expect(sut.rootRequire).toEqual(rootRequire);
  });

  it('should load the project targets', () => {
    // Given
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const projectConfiguration = {
      targets: {
        targetOne: {
          type: 'node',
        },
        targetTwo: {
          folder: 'target-two',
          createFolder: true,
          transpile: true,
        },
        targetThree: {
          folder: 'target-three',
          createFolder: true,
          transpile: false,
          flow: true,
        },
        targetFour: {
          type: 'browser',
          hasFolder: false,
        },
      },
      targetsTemplates: {
        node: {
          defaultTargetName: 'node',
          hasFolder: true,
        },
        browser: {
          defaultTargetName: 'browser',
        },
      },
      paths: {
        source,
        build,
      },
    };
    const rootRequire = 'rootRequire';
    const expectedTargets = {
      targetOne: {
        defaultTargetName: 'node',
        type: 'node',
        name: 'targetOne',
        paths: {
          source: `${source}/targetOne`,
          build,
        },
        folders: {
          source: `${source}/targetOne`,
          build,
        },
        hasFolder: true,
        is: {
          node: true,
          browser: false,
        },
      },
      targetTwo: {
        defaultTargetName: 'node',
        hasFolder: true,
        folder: 'target-two',
        createFolder: true,
        transpile: true,
        name: 'targetTwo',
        type: 'node',
        paths: {
          source: `${source}/target-two`,
          build: `${build}/target-two`,
        },
        folders: {
          source: `${source}/target-two`,
          build: `${build}/target-two`,
        },
        is: {
          node: true,
          browser: false,
        },
      },
      targetThree: {
        defaultTargetName: 'node',
        hasFolder: true,
        folder: 'target-three',
        createFolder: true,
        transpile: true,
        flow: true,
        name: 'targetThree',
        type: 'node',
        paths: {
          source: `${source}/target-three`,
          build: `${build}/target-three`,
        },
        folders: {
          source: `${source}/target-three`,
          build: `${build}/target-three`,
        },
        is: {
          node: true,
          browser: false,
        },
      },
      targetFour: {
        defaultTargetName: 'browser',
        type: 'browser',
        hasFolder: false,
        name: 'targetFour',
        paths: {
          source,
          build,
        },
        folders: {
          source,
          build,
        },
        is: {
          node: false,
          browser: true,
        },
      },
    };
    const expectedTargetsNames = Object.keys(expectedTargets);
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    result = sut.getTargets();
    // Then
    expect(result).toEqual(expectedTargets);
    expect(events.reduce).toHaveBeenCalledTimes(expectedTargetsNames.length);
    expectedTargetsNames.forEach((targetName) => {
      expect(events.reduce).toHaveBeenCalledWith(
        'target-load',
        expectedTargets[targetName]
      );
    });
  });

  it('should get a target by its name', () => {
    // Given
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const targetName = 'targetOne';
    const projectConfiguration = {
      targets: {
        [targetName]: {
          type: 'node',
        },
      },
      targetsTemplates: {
        node: {
          defaultTargetName: 'node',
          hasFolder: true,
        },
      },
      paths: {
        source,
        build,
      },
    };
    const rootRequire = 'rootRequire';
    const expectedTarget = {
      defaultTargetName: 'node',
      type: 'node',
      name: targetName,
      paths: {
        source: `${source}/targetOne`,
        build,
      },
      folders: {
        source: `${source}/targetOne`,
        build,
      },
      hasFolder: true,
      is: {
        node: true,
        browser: false,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    result = sut.getTarget(targetName);
    // Then
    expect(result).toEqual(expectedTarget);
  });

  it('should throw an error while trying to load a target with an invalid type', () => {
    // Given
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const projectConfiguration = {
      targets: {
        targetOne: {
          type: 'some-other-type',
        },
      },
      targetsTemplates: {
        node: {},
      },
      paths: {
        source: 'source-path',
        build: 'build-path',
      },
    };
    const rootRequire = 'rootRequire';
    // When/Then
    expect(() => new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    ))
    .toThrow(/invalid type/i);
  });

  it('should throw an error when trying to get a target that doesn\'t exist', () => {
    // Given
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = 'rootRequire';
    let sut = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    // Then
    expect(() => sut.getTarget('some-target'))
    .toThrow(/The required target doesn't exist/i);
  });

  it('should find a target by a filepath', () => {
    // Given
    const source = 'source-path';
    const folder = 'target-three';
    const file = `some-path/${source}/${folder}/file.js`;
    const targetName = 'targetThree';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const projectConfiguration = {
      targets: {
        [targetName]: {
          type: 'node',
          folder,
          hasFolder: true,
          createFolder: true,
          transpile: false,
          flow: true,
        },
      },
      targetsTemplates: {
        node: {},
      },
      paths: {
        source,
        build: 'build-path',
      },
    };
    const rootRequire = 'rootRequire';
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    result = sut.findTargetForFile(file);
    // Then
    expect(result).toBeObject();
    expect(result.name).toBe(targetName);
  });

  it('should throw an error if it can\'t find a target by a filepath', () => {
    // Given
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = 'rootRequire';
    let sut = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    // Then
    expect(() => sut.findTargetForFile('some-file'))
    .toThrow(/A target for the following file couldn't be found/i);
  });

  it('should throw an error when trying to generate a configuration for a Node target', () => {
    // Given
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = 'rootRequire';
    const target = {
      is: {
        node: true,
      },
    };
    let sut = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    // Then
    expect(() => sut.getBrowserTargetConfiguration(target))
    .toThrow(/Only browser targets can generate configuration on the building process/i);
  });

  it('shouldn\'t generate any configuration if the feature flag is disabled', () => {
    // Given
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = 'rootRequire';
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      configuration: {
        enabled: false,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual({});
  });

  it('should generate a browser target config by loading from an external file', () => {
    // Given
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const defaultConfig = {
      someProp: 'someValue',
    };
    const rootRequire = jest.fn(() => defaultConfig);
    const getConfig = jest.fn(() => defaultConfig);
    WootilsAppConfigurationMock.mock('getConfig', getConfig);
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      configuration: {
        enabled: true,
        default: null,
        path: 'config/',
        hasFolder: false,
        environmentVariable: 'CONFIG',
        loadFromEnvironment: true,
        filenameFormat: '[target-name].[configuration-name].config.js',
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual(defaultConfig);
    expect(rootRequire).toHaveBeenCalledTimes(1);
    expect(rootRequire)
    .toHaveBeenCalledWith(`${target.configuration.path}${target.name}.config.js`);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledWith(
      environmentUtils,
      rootRequire,
      target.name,
      defaultConfig,
      {
        environmentVariable: target.configuration.environmentVariable,
        path: target.configuration.path,
        filenameFormat: `${target.name}.[name].config.js`,
      }
    );
    expect(WootilsAppConfigurationMock.mocks.loadFromEnvironment).toHaveBeenCalledTimes(1);
  });

  it('should look for a browser target default config inside a folder with its name', () => {
    // Given
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const defaultConfig = {
      someProp: 'someValue',
    };
    const rootRequire = jest.fn(() => defaultConfig);
    const getConfig = jest.fn(() => defaultConfig);
    WootilsAppConfigurationMock.mock('getConfig', getConfig);
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      configuration: {
        enabled: true,
        default: null,
        path: 'config/',
        hasFolder: true,
        environmentVariable: 'CONFIG',
        loadFromEnvironment: true,
        filenameFormat: '[target-name].[configuration-name].config.js',
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual(defaultConfig);
    expect(rootRequire).toHaveBeenCalledTimes(1);
    expect(rootRequire)
    .toHaveBeenCalledWith(`${target.configuration.path}${target.name}/${target.name}.config.js`);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledWith(
      environmentUtils,
      rootRequire,
      target.name,
      defaultConfig,
      {
        environmentVariable: target.configuration.environmentVariable,
        path: `${target.configuration.path}${target.name}/`,
        filenameFormat: `${target.name}.[name].config.js`,
      }
    );
    expect(WootilsAppConfigurationMock.mocks.loadFromEnvironment).toHaveBeenCalledTimes(1);
  });

  it('should receive the default browser target configuration as a option property', () => {
    // Given
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const defaultConfig = {
      someProp: 'someValue',
    };
    const rootRequire = jest.fn();
    const getConfig = jest.fn(() => defaultConfig);
    WootilsAppConfigurationMock.mock('getConfig', getConfig);
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      configuration: {
        enabled: true,
        default: defaultConfig,
        path: 'config/',
        hasFolder: true,
        environmentVariable: 'CONFIG',
        loadFromEnvironment: false,
        filenameFormat: '[target-name].[configuration-name].config.js',
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      events,
      environmentUtils,
      pathUtils,
      projectConfiguration,
      rootRequire
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual(defaultConfig);
    expect(rootRequire).toHaveBeenCalledTimes(0);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledWith(
      environmentUtils,
      rootRequire,
      target.name,
      defaultConfig,
      {
        environmentVariable: target.configuration.environmentVariable,
        path: `${target.configuration.path}${target.name}/`,
        filenameFormat: `${target.name}.[name].config.js`,
      }
    );
    expect(WootilsAppConfigurationMock.mocks.loadFromEnvironment).toHaveBeenCalledTimes(0);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => projectConfiguration } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    targets(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('targets');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(Targets);
    expect(sut.events).toBe('events');
    expect(sut.environmentUtils).toBe('environmentUtils');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.projectConfiguration).toEqual(projectConfiguration);
    expect(sut.rootRequire).toBe('rootRequire');
  });
});
