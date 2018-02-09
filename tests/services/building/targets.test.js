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

const originalNow = Date.now;

describe('services/building:targets', () => {
  beforeEach(() => {
    WootilsAppConfigurationMock.reset();
  });

  afterEach(() => {
    Date.now = originalNow;
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
        entry: {},
        output: {},
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
        entry: {},
        output: {},
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
        entry: {},
        output: {},
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
        entry: {},
        output: {},
        paths: { source, build },
        folders: { source, build },
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

  it('should load the project targets and resolve their entries and outputs', () => {
    // Given
    const hash = '2509';
    Date.now = () => hash;
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
        targetOne: {},
        targetTwo: {
          type: 'browser',
          entry: {
            default: 'index.jsx',
          },
          output: {
            default: {
              js: 'statics/js/[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            development: null,
            production: null,
          },
        },
        targetThree: {
          type: 'browser',
          entry: {
            default: 'index.jsx',
            development: 'playground.js',
          },
          output: {
            default: {
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            development: {
              fonts: null,
              css: null,
              images: null,
              js: 'statics/js/[target-name].development.js',
            },
            production: {
              fonts: null,
              css: null,
              images: null,
              js: 'statics/js/[target-name].production.js',
            },
          },
        },
        targetFour: {
          type: 'browser',
          entry: {
            default: null,
            development: 'index.js',
          },
        },
        targetFive: {
          output: {
            default: 'start.js',
          },
        },
        targetSix: {
          output: {
            development: 'start.development.js',
          },
        },
        targetSeven: {
          output: {
            default: null,
            production: 'start.production.js',
          },
        },
      },
      targetsTemplates: {
        node: {
          defaultTargetName: 'node',
          hasFolder: false,
          entry: {
            default: 'index.js',
            development: null,
            production: null,
          },
          output: {
            default: '[target-name].js',
            development: null,
            production: null,
          },
        },
        browser: {
          defaultTargetName: 'browser',
          hasFolder: false,
          entry: {
            default: 'index.js',
            development: null,
            production: null,
          },
          output: {
            default: {
              js: 'statics/js/[target-name].[hash].js',
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
            development: {
              js: 'statics/js/[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: null,
          },
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
        name: 'targetOne',
        defaultTargetName: 'node',
        type: 'node',
        entry: {
          development: 'index.js',
          production: 'index.js',
        },
        output: {
          development: 'targetOne.js',
          production: 'targetOne.js',
        },
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: true,
          browser: false,
        },
      },
      targetTwo: {
        name: 'targetTwo',
        defaultTargetName: 'browser',
        entry: {
          development: 'index.jsx',
          production: 'index.jsx',
        },
        output: {
          development: {
            js: 'statics/js/targetTwo.js',
            fonts: 'statics/fonts/[name].[ext]',
            css: 'statics/styles/targetTwo.css',
            images: 'statics/images/[name].[ext]',
          },
          production: {
            js: 'statics/js/targetTwo.js',
            fonts: 'statics/fonts/[name].[ext]',
            css: 'statics/styles/targetTwo.css',
            images: 'statics/images/[name].[ext]',
          },
        },
        type: 'browser',
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: false,
          browser: true,
        },
      },
      targetThree: {
        name: 'targetThree',
        defaultTargetName: 'browser',
        entry: {
          development: 'playground.js',
          production: 'index.jsx',
        },
        output: {
          development: {
            fonts: 'statics/fonts/[name].[ext]',
            css: 'statics/styles/targetThree.css',
            images: 'statics/images/[name].[ext]',
            js: 'statics/js/targetThree.development.js',
          },
          production: {
            fonts: 'statics/fonts/[name].[ext]',
            css: 'statics/styles/targetThree.css',
            images: 'statics/images/[name].[ext]',
            js: 'statics/js/targetThree.production.js',
          },
        },
        type: 'browser',
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: false,
          browser: true,
        },
      },
      targetFour: {
        name: 'targetFour',
        defaultTargetName: 'browser',
        type: 'browser',
        entry: {
          development: 'index.js',
          production: null,
        },
        output: {
          development: {
            js: 'statics/js/targetFour.js',
            fonts: 'statics/fonts/[name].[ext]',
            css: 'statics/styles/targetFour.css',
            images: 'statics/images/[name].[ext]',
          },
          production: {
            js: `statics/js/targetFour.${hash}.js`,
            fonts: `statics/fonts/[name].${hash}.[ext]`,
            css: `statics/styles/targetFour.${hash}.css`,
            images: `statics/images/[name].${hash}.[ext]`,
          },
        },
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: false,
          browser: true,
        },
      },
      targetFive: {
        name: 'targetFive',
        defaultTargetName: 'node',
        type: 'node',
        entry: {
          development: 'index.js',
          production: 'index.js',
        },
        output: {
          development: 'start.js',
          production: 'start.js',
        },
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: true,
          browser: false,
        },
      },
      targetSix: {
        name: 'targetSix',
        defaultTargetName: 'node',
        type: 'node',
        entry: {
          development: 'index.js',
          production: 'index.js',
        },
        output: {
          development: 'start.development.js',
          production: 'targetSix.js',
        },
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: true,
          browser: false,
        },
      },
      targetSeven: {
        name: 'targetSeven',
        defaultTargetName: 'node',
        type: 'node',
        entry: {
          development: 'index.js',
          production: 'index.js',
        },
        output: {
          development: null,
          production: 'start.production.js',
        },
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: true,
          browser: false,
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

  it('should load the project targets and resolve the browser targets `html` setting', () => {
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
          type: 'browser',
        },
        targetTwo: {
          type: 'browser',
          html: {
            template: 'done.html',
          },
        },
        targetThree: {
          type: 'browser',
          html: {
            filename: 'done.html',
          },
        },
        targetFour: {
          type: 'browser',
          html: {
            template: 'template.html',
            filename: 'filename.html',
          },
        },
      },
      targetsTemplates: {
        browser: {
          defaultTargetName: 'browser',
          hasFolder: false,
          html: {
            default: 'index.html',
            template: null,
            filename: null,
          },
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
        name: 'targetOne',
        defaultTargetName: 'browser',
        entry: {},
        output: {},
        html: {
          template: 'index.html',
          filename: 'index.html',
        },
        type: 'browser',
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: false,
          browser: true,
        },
      },
      targetTwo: {
        name: 'targetTwo',
        defaultTargetName: 'browser',
        entry: {},
        output: {},
        html: {
          template: 'done.html',
          filename: 'index.html',
        },
        type: 'browser',
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: false,
          browser: true,
        },
      },
      targetThree: {
        name: 'targetThree',
        defaultTargetName: 'browser',
        entry: {},
        output: {},
        html: {
          template: 'index.html',
          filename: 'done.html',
        },
        type: 'browser',
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
        is: {
          node: false,
          browser: true,
        },
      },
      targetFour: {
        name: 'targetFour',
        defaultTargetName: 'browser',
        entry: {},
        output: {},
        html: {
          template: 'template.html',
          filename: 'filename.html',
        },
        type: 'browser',
        paths: { source, build },
        folders: { source, build },
        hasFolder: false,
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
      entry: {},
      output: {},
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
