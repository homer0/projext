const JimpleMock = require('/tests/mocks/jimple.mock');
const WootilsAppConfigurationMock = require('/tests/mocks/wootilsAppConfiguration.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('wootils/node/appConfiguration', () => ({
  AppConfiguration: WootilsAppConfigurationMock,
}));
jest.mock('fs-extra');

jest.unmock('/src/services/targets/targets');

const path = require('path');
const fs = require('fs-extra');
require('jasmine-expect');
const { Targets, targets } = require('/src/services/targets/targets');

const originalNow = Date.now;

describe('services/targets:targets', () => {
  beforeEach(() => {
    WootilsAppConfigurationMock.reset();
    fs.pathExistsSync.mockReset();
  });

  afterEach(() => {
    Date.now = originalNow;
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(sut).toBeInstanceOf(Targets);
    expect(sut.events).toBe(events);
    expect(sut.environmentUtils).toBe(environmentUtils);
    expect(sut.packageInfo).toBe(packageInfo);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.projectConfiguration).toEqual(projectConfiguration);
    expect(sut.rootRequire).toEqual(rootRequire);
    expect(sut.utils).toEqual(utils);
  });

  it('should load the project targets', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
          dotEnv: {
            files: [
              '.env.browser',
            ],
          },
        },
        targetFive: {
          folder: 'target-five',
          createFolder: true,
          transpile: false,
          typeScript: true,
        },
      },
      targetsTemplates: {
        node: {
          defaultTargetName: 'node',
          hasFolder: true,
          engine: 'webpack',
          dotEnv: {
            enabled: true,
            files: [
              '.env',
            ],
          },
        },
        browser: {
          defaultTargetName: 'browser',
          engine: 'webpack',
          dotEnv: {
            enabled: true,
            files: [
              '.env',
            ],
          },
        },
      },
      paths: {
        source,
        build,
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    const expectedTargets = {
      targetOne: {
        defaultTargetName: 'node',
        type: 'node',
        name: 'targetOne',
        entry: {},
        output: {},
        originalOutput: {},
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
        engine: 'webpack',
        dotEnv: {
          enabled: true,
          files: [
            '.env',
          ],
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
        originalOutput: {},
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
        engine: 'webpack',
        dotEnv: {
          enabled: true,
          files: [
            '.env',
          ],
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
        originalOutput: {},
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
        engine: 'webpack',
        dotEnv: {
          enabled: true,
          files: [
            '.env',
          ],
        },
      },
      targetFour: {
        defaultTargetName: 'browser',
        type: 'browser',
        hasFolder: false,
        name: 'targetFour',
        entry: {},
        output: {},
        originalOutput: {},
        paths: { source, build },
        folders: { source, build },
        is: {
          node: false,
          browser: true,
        },
        engine: 'webpack',
        dotEnv: {
          enabled: true,
          files: [
            '.env.browser',
          ],
        },
      },
      targetFive: {
        defaultTargetName: 'node',
        hasFolder: true,
        folder: 'target-five',
        createFolder: true,
        transpile: true,
        typeScript: true,
        name: 'targetFive',
        entry: {},
        output: {},
        originalOutput: {},
        type: 'node',
        paths: {
          source: `${source}/target-five`,
          build: `${build}/target-five`,
        },
        folders: {
          source: `${source}/target-five`,
          build: `${build}/target-five`,
        },
        is: {
          node: true,
          browser: false,
        },
        engine: 'webpack',
        dotEnv: {
          enabled: true,
          files: [
            '.env',
          ],
        },
      },
    };
    const expectedTargetsNames = Object.keys(expectedTargets);
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
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
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const targetsData = [
      /**
       * Target without any customization.
       */
      {
        config: {
          name: 'targetOne',
        },
        expected: {
          name: 'targetOne',
          type: 'node',
          entry: {
            development: 'index.js',
            production: 'index.js',
          },
          output: {
            development: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
          },
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: true,
            browser: false,
          },
          engine: 'webpack',
        },
      },
      /**
       * Target with customized default and development entries
       */
      {
        config: {
          name: 'targetTwo',
          entry: {
            default: 'library.js',
            development: 'playground.js',
          },
        },
        expected: {
          name: 'targetTwo',
          type: 'node',
          entry: {
            development: 'playground.js',
            production: 'library.js',
          },
          output: {
            development: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
          },
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: true,
            browser: false,
          },
          engine: 'webpack',
        },
      },
      /**
       * Target without a default entry and with a customized development entry.
       */
      {
        config: {
          name: 'targetThree',
          entry: {
            default: null,
            development: 'playground.js',
          },
        },
        expected: {
          name: 'targetThree',
          type: 'node',
          entry: {
            development: 'playground.js',
            production: null,
          },
          output: {
            development: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
          },
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: true,
            browser: false,
          },
          engine: 'webpack',
        },
      },
      /**
       * Target with a customized default output and no other out settings.
       */
      {
        config: {
          name: 'targetFour',
          output: {
            default: {
              js: 'app/[target-name].js',
              jsChunks: true,
              fonts: 'app/fonts/[name].[ext]',
              css: 'app/styles/[target-name].css',
              images: 'app/images/[name].[ext]',
            },
            development: null,
            production: null,
          },
        },
        expected: {
          name: 'targetFour',
          type: 'node',
          entry: {
            development: 'index.js',
            production: 'index.js',
          },
          output: {
            development: {
              js: 'app/[target-name].js',
              jsChunks: true,
              fonts: 'app/fonts/[name].[ext]',
              css: 'app/styles/[target-name].css',
              images: 'app/images/[name].[ext]',
            },
            production: {
              js: 'app/[target-name].js',
              jsChunks: true,
              fonts: 'app/fonts/[name].[ext]',
              css: 'app/styles/[target-name].css',
              images: 'app/images/[name].[ext]',
            },
          },
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: true,
            browser: false,
          },
          engine: 'webpack',
        },
      },
      /**
       * Target with merged output settings.
       */
      {
        config: {
          name: 'targetFive',
          output: {
            default: {
              fonts: 'app/fonts/[name].[ext]',
              css: 'app/styles/[target-name].css',
              images: 'app/images/[name].[ext]',
            },
            development: {
              fonts: null,
              css: null,
              images: null,
              js: 'app/[target-name].development.js',
            },
            production: {
              fonts: null,
              css: null,
              images: null,
              js: 'app/[target-name].production.js',
            },
          },
        },
        expected: {
          name: 'targetFive',
          type: 'node',
          entry: {
            development: 'index.js',
            production: 'index.js',
          },
          output: {
            development: {
              js: 'app/[target-name].development.js',
              fonts: 'app/fonts/[name].[ext]',
              css: 'app/styles/[target-name].css',
              images: 'app/images/[name].[ext]',
            },
            production: {
              js: 'app/[target-name].production.js',
              fonts: 'app/fonts/[name].[ext]',
              css: 'app/styles/[target-name].css',
              images: 'app/images/[name].[ext]',
            },
          },
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: true,
            browser: false,
          },
          engine: 'webpack',
        },
      },
      /**
       * Target with a TypeScript file.
       */
      {
        config: {
          name: 'targetSix',
          entry: {
            default: 'index.ts',
          },
        },
        expected: {
          name: 'targetSix',
          type: 'node',
          entry: {
            development: 'index.ts',
            production: 'index.ts',
          },
          output: {
            development: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
          },
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: true,
            browser: false,
          },
          engine: 'webpack',
          typeScript: true,
          transpile: true,
        },
      },
      /**
       * Target with a TypeScript React file.
       */
      {
        config: {
          name: 'targetSeven',
          entry: {
            default: 'index.tsx',
          },
        },
        expected: {
          name: 'targetSeven',
          type: 'node',
          entry: {
            development: 'index.tsx',
            production: 'index.tsx',
          },
          output: {
            development: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
          },
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: true,
            browser: false,
          },
          engine: 'webpack',
          typeScript: true,
          transpile: true,
          framework: 'react',
        },
      },
    ];
    const targetsDict = {};
    const expectedTargets = {};
    const expectedReplacements = [];
    targetsData.forEach((data) => {
      targetsDict[data.config.name] = data.config;
      expectedTargets[data.expected.name] = data.expected;
      expectedTargets[data.expected.name].originalOutput = data.expected.output;
      expectedReplacements.push(
        ...Object.keys(data.expected.output.development)
        .filter((name) => typeof data.expected.output.development[name] === 'string')
        .map((name) => ({
          targetName: data.expected.name,
          string: data.expected.output.development[name],
        }))
      );
      expectedReplacements.push(
        ...Object.keys(data.expected.output.production)
        .filter((name) => typeof data.expected.output.production[name] === 'string')
        .map((name) => ({
          targetName: data.expected.name,
          string: data.expected.output.production[name],
        }))
      );
    });
    const projectConfiguration = {
      targets: targetsDict,
      targetsTemplates: {
        node: {
          hasFolder: false,
          engine: 'webpack',
          entry: {
            default: 'index.js',
            development: null,
            production: null,
          },
          output: {
            default: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
            development: {
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
    const utils = {
      replacePlaceholders: jest.fn((string) => string),
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getTargets();
    // Then
    expect(result).toEqual(expectedTargets);
    expect(events.reduce).toHaveBeenCalledTimes(targetsData.length);
    targetsData.forEach((info) => {
      expect(events.reduce).toHaveBeenCalledWith(
        'target-load',
        info.expected
      );
    });
    expect(utils.replacePlaceholders).toHaveBeenCalledTimes(expectedReplacements.length);
    expectedReplacements.forEach((info) => {
      expect(utils.replacePlaceholders).toHaveBeenCalledWith(info.string, {
        'target-name': info.targetName,
        hash,
      });
    });
  });

  it('should load the project targets and resolve the browser targets `html` setting', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const targetsData = [
      {
        config: {
          name: 'targetOne',
          type: 'browser',
        },
        expected: {
          name: 'targetOne',
          defaultTargetName: 'browser',
          entry: {},
          output: {},
          originalOutput: {},
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
          engine: 'webpack',
        },
      },
      {
        config: {
          name: 'targetTwo',
          type: 'browser',
          html: {
            template: 'done.html',
          },
        },
        expected: {
          name: 'targetTwo',
          defaultTargetName: 'browser',
          entry: {},
          output: {},
          originalOutput: {},
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
          engine: 'webpack',
        },
      },
      {
        config: {
          name: 'targetThree',
          type: 'browser',
          html: {
            filename: 'done.html',
          },
        },
        expected: {
          name: 'targetThree',
          defaultTargetName: 'browser',
          entry: {},
          output: {},
          originalOutput: {},
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
          engine: 'webpack',
        },
      },
      {
        config: {
          name: 'targetFour',
          type: 'browser',
          html: {
            template: 'template.html',
            filename: 'filename.html',
          },
        },
        expected: {
          name: 'targetFour',
          defaultTargetName: 'browser',
          entry: {},
          output: {},
          originalOutput: {},
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
          engine: 'webpack',
        },
      },
      {
        config: {
          name: 'targetFive',
          type: 'browser',
          html: {
            default: null,
          },
        },
        expected: {
          name: 'targetFive',
          defaultTargetName: 'browser',
          entry: {},
          output: {},
          originalOutput: {},
          html: {
            template: null,
            filename: null,
          },
          type: 'browser',
          paths: { source, build },
          folders: { source, build },
          hasFolder: false,
          is: {
            node: false,
            browser: true,
          },
          engine: 'webpack',
        },
      },
    ];
    const targetsDict = {};
    const expectedTargets = {};
    targetsData.forEach((data) => {
      targetsDict[data.config.name] = data.config;
      expectedTargets[data.expected.name] = data.expected;
    });
    const projectConfiguration = {
      targets: targetsDict,
      targetsTemplates: {
        browser: {
          defaultTargetName: 'browser',
          hasFolder: false,
          html: {
            default: 'index.html',
            template: null,
            filename: null,
          },
          engine: 'webpack',
        },
      },
      paths: {
        source,
        build,
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getTargets();
    // Then
    expect(result).toEqual(expectedTargets);
    expect(events.reduce).toHaveBeenCalledTimes(targetsData.length);
    targetsData.forEach((info) => {
      expect(events.reduce).toHaveBeenCalledWith(
        'target-load',
        info.expected
      );
    });
  });

  it('should get a target by its name', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    const expectedTarget = {
      defaultTargetName: 'node',
      type: 'node',
      name: targetName,
      entry: {},
      output: {},
      originalOutput: {},
      paths: {
        source: `${source}/${targetName}`,
        build,
      },
      folders: {
        source: `${source}/${targetName}`,
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
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getTarget(targetName);
    // Then
    expect(result).toEqual(expectedTarget);
  });

  it('should get a target with the project\'s name as the default target', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const projectName = 'myAppForCharito';
    const packageInfo = {
      name: projectName,
    };
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const projectConfiguration = {
      targets: {
        [projectName]: {
          type: 'node',
        },
        someOtherTarget: {
          type: 'browser',
        },
        abc: {
          type: 'node',
        },
      },
      targetsTemplates: {
        node: {
          defaultTargetName: 'node',
          hasFolder: true,
          engine: 'webpack',
        },
        browser: {
          engine: 'webpack',
        },
      },
      paths: {
        source,
        build,
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    const expectedTarget = {
      defaultTargetName: 'node',
      type: 'node',
      name: projectName,
      entry: {},
      output: {},
      originalOutput: {},
      paths: {
        source: `${source}/${projectName}`,
        build,
      },
      folders: {
        source: `${source}/${projectName}`,
        build,
      },
      hasFolder: true,
      is: {
        node: true,
        browser: false,
      },
      engine: 'webpack',
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getDefaultTarget();
    // Then
    expect(result).toEqual(expectedTarget);
  });

  it('should get the first target (by alphabetical order) as the default target', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = {
      name: 'myAppForCharito',
    };
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const targetName = 'aaa';
    const projectConfiguration = {
      targets: {
        abc: {
          type: 'node',
        },
        [targetName]: {
          type: 'node',
        },
        someOtherTarget: {
          type: 'browser',
        },
      },
      targetsTemplates: {
        node: {
          defaultTargetName: 'node',
          hasFolder: true,
          engine: 'webpack',
        },
        browser: {
          engine: 'webpack',
        },
      },
      paths: {
        source,
        build,
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    const expectedTarget = {
      defaultTargetName: 'node',
      type: 'node',
      name: targetName,
      entry: {},
      output: {},
      originalOutput: {},
      paths: {
        source: `${source}/${targetName}`,
        build,
      },
      folders: {
        source: `${source}/${targetName}`,
        build,
      },
      hasFolder: true,
      is: {
        node: true,
        browser: false,
      },
      engine: 'webpack',
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getDefaultTarget();
    // Then
    expect(result).toEqual(expectedTarget);
  });

  it('should get a target with an specific type as the default target', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const projectName = 'myAppForCharito';
    const packageInfo = {
      name: projectName,
    };
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const targetName = 'charito';
    const type = 'browser';
    const projectConfiguration = {
      targets: {
        [projectName]: {
          type: 'node',
        },
        [targetName]: {
          type,
        },
        abc: {
          type: 'node',
        },
      },
      targetsTemplates: {
        node: {
          defaultTargetName: 'node',
          hasFolder: true,
          engine: 'webpack',
        },
        browser: {
          hasFolder: false,
          engine: 'webpack',
        },
      },
      paths: {
        source,
        build,
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    const expectedTarget = {
      type,
      name: targetName,
      entry: {},
      output: {},
      originalOutput: {},
      paths: {
        source,
        build,
      },
      folders: {
        source,
        build,
      },
      hasFolder: false,
      is: {
        node: false,
        browser: true,
      },
      engine: 'webpack',
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getDefaultTarget(type);
    // Then
    expect(result).toEqual(expectedTarget);
  });

  it('should throw an error while trying to get the default target without having targets', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(() => sut.getDefaultTarget()).toThrow(/the project doesn't have any targets/i);
  });

  it('should throw an error while trying to get the default target with an specific type', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const type = 'browser';
    const projectConfiguration = {
      targets: {
        targetOne: {
          type: 'node',
        },
        abc: {
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
        source: '',
        build: '',
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(() => sut.getDefaultTarget(type))
    .toThrow(/the project doesn't have any targets of the required type/i);
  });

  it('should throw an error while trying to get the default target with an invalid type', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(() => sut.getDefaultTarget('batman'))
    .toThrow(/invalid target type/i);
  });

  it('should throw an error while trying to load a target with an invalid type', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    // When/Then
    expect(() => new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    ))
    .toThrow(/invalid type/i);
  });

  it('should throw an error for a node target with bundling but no build engine', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const projectConfiguration = {
      targets: {
        targetOne: {
          bundle: true,
        },
      },
      targetsTemplates: {
        node: {
          type: 'node',
        },
      },
      paths: {
        source: 'source-path',
        build: 'build-path',
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    // When/Then
    expect(() => new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    ))
    .toThrow(/no build engine/i);
  });

  it('should throw an error for a browser target with no build engine', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const projectConfiguration = {
      targets: {
        targetOne: {
          type: 'browser',
        },
      },
      targetsTemplates: {
        browser: {
          type: 'browser',
        },
      },
      paths: {
        source: 'source-path',
        build: 'build-path',
      },
    };
    const rootRequire = 'rootRequire';
    const utils = 'utils';
    // When/Then
    expect(() => new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    ))
    .toThrow(/no build engine/i);
  });

  it('should validate that a target exists', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: (...args) => path.join(...args),
    };
    const source = 'source-path';
    const build = 'build-path';
    const validTargetName = 'charito';
    const invalidTargetName = 'something';
    const projectConfiguration = {
      targets: {
        [validTargetName]: {
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
    const utils = 'utils';
    let sut = null;
    let validResult = null;
    let invalidResult = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    validResult = sut.targetExists(validTargetName);
    invalidResult = sut.targetExists(invalidTargetName);
    // Then
    expect(validResult).toBeTrue();
    expect(invalidResult).toBeFalse();
  });

  it('should throw an error when trying to get a target that doesn\'t exist', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
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
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((name, target) => target),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.findTargetForFile(file);
    // Then
    expect(result).toBeObject();
    expect(result.name).toBe(targetName);
  });

  it('should throw an error if it can\'t find a target by a filepath', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(() => sut.findTargetForFile('some-file'))
    .toThrow(/A target couldn't be find for the following file/i);
  });

  it('should throw an error when trying to generate a configuration for a Node target', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    const target = {
      is: {
        node: true,
      },
    };
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(() => sut.getBrowserTargetConfiguration(target))
    .toThrow(/Only browser targets can generate configuration on the building process/i);
  });

  it('shouldn\'t generate any configuration if the feature flag is disabled', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
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
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual({
      configuration: {},
      files: [],
    });
  });

  it('should generate a browser target config by loading from an external file', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
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
    const expectedConfigFile = `${target.configuration.path}${target.name}.config.js`;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual({
      configuration: defaultConfig,
      files: [expectedConfigFile],
    });
    expect(rootRequire).toHaveBeenCalledTimes(1);
    expect(rootRequire).toHaveBeenCalledWith(expectedConfigFile);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledWith(
      environmentUtils,
      expect.any(Function),
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
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
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
    const expectedConfigDir = `${target.configuration.path}${target.name}/`;
    const expectedConfigFile = `${expectedConfigDir}${target.name}.config.js`;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual({
      configuration: defaultConfig,
      files: [expectedConfigFile],
    });
    expect(rootRequire).toHaveBeenCalledTimes(1);
    expect(rootRequire).toHaveBeenCalledWith(expectedConfigFile);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledWith(
      environmentUtils,
      expect.any(Function),
      target.name,
      defaultConfig,
      {
        environmentVariable: target.configuration.environmentVariable,
        path: expectedConfigDir,
        filenameFormat: `${target.name}.[name].config.js`,
      }
    );
    expect(WootilsAppConfigurationMock.mocks.loadFromEnvironment).toHaveBeenCalledTimes(1);
  });

  it('should receive the default browser target configuration as an option property', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
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
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getBrowserTargetConfiguration(target);
    // Then
    expect(result).toEqual({
      configuration: defaultConfig,
      files: [],
    });
    expect(rootRequire).toHaveBeenCalledTimes(0);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledTimes(1);
    expect(WootilsAppConfigurationMock.mocks.constructor).toHaveBeenCalledWith(
      environmentUtils,
      expect.any(Function),
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

  it('shouldn\'t inject any environment variables if the feature flag is disabled', () => {
    // Given
    const dotEnvUtils = {
      load: jest.fn(),
    };
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      dotEnv: {
        enabled: false,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.loadTargetDotEnvFile(target);
    // Then
    expect(result).toEqual({});
    expect(dotEnvUtils.load).toHaveBeenCalledTimes(0);
  });

  it('shouldn\'t inject any environment variables if no files are loaded', () => {
    // Given
    const dotEnvUtils = {
      load: jest.fn(() => ({
        loaded: false,
      })),
      inject: jest.fn(),
    };
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    const dotEnvFile = '.env.[target-name].[build-type]';
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      dotEnv: {
        enabled: true,
        extend: true,
        files: [dotEnvFile],
      },
    };
    const expectedDotEnvFile = `.env.${target.name}.development`;
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.loadTargetDotEnvFile(target);
    // Then
    expect(result).toEqual({});
    expect(dotEnvUtils.load).toHaveBeenCalledTimes(1);
    expect(dotEnvUtils.load).toHaveBeenCalledWith([expectedDotEnvFile], target.dotEnv.extend);
    expect(dotEnvUtils.inject).toHaveBeenCalledTimes(0);
  });

  it('should reduce and inject environment variables for a target', () => {
    // Given
    const loadedVariables = {
      ROSARIO: 'Charito',
      PILAR: 'Pili',
    };
    const dotEnvUtils = {
      load: jest.fn(() => ({
        loaded: true,
        variables: loadedVariables,
      })),
      inject: jest.fn(),
    };
    const events = {
      reduce: jest.fn((name, variables) => variables),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    const dotEnvFile = '.env.[target-name].[build-type]';
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      dotEnv: {
        enabled: true,
        extend: true,
        files: [dotEnvFile],
      },
    };
    const buildType = 'production';
    const expectedDotEnvFile = `.env.${target.name}.${buildType}`;
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.loadTargetDotEnvFile(target, buildType);
    // Then
    expect(result).toEqual(loadedVariables);
    expect(dotEnvUtils.load).toHaveBeenCalledTimes(1);
    expect(dotEnvUtils.load).toHaveBeenCalledWith([expectedDotEnvFile], target.dotEnv.extend);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'target-environment-variables',
      loadedVariables,
      target,
      buildType
    );
    expect(dotEnvUtils.inject).toHaveBeenCalledTimes(1);
    expect(dotEnvUtils.inject).toHaveBeenCalledWith(loadedVariables);
  });

  it('should reduce but not inject environment variables for a target', () => {
    // Given
    const loadedVariables = {
      ROSARIO: 'Charito',
      PILAR: 'Pili',
    };
    const dotEnvUtils = {
      load: jest.fn(() => ({
        loaded: true,
        variables: loadedVariables,
      })),
      inject: jest.fn(),
    };
    const events = {
      reduce: jest.fn((name, variables) => variables),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
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
    const utils = 'utils';
    const dotEnvFile = '.env.[target-name].[build-type]';
    const target = {
      name: 'my-target',
      is: {
        node: false,
      },
      dotEnv: {
        enabled: true,
        extend: true,
        files: [dotEnvFile],
      },
    };
    const buildType = 'production';
    const expectedDotEnvFile = `.env.${target.name}.${buildType}`;
    let sut = null;
    let result = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.loadTargetDotEnvFile(target, buildType, false);
    // Then
    expect(result).toEqual(loadedVariables);
    expect(dotEnvUtils.load).toHaveBeenCalledTimes(1);
    expect(dotEnvUtils.load).toHaveBeenCalledWith([expectedDotEnvFile], target.dotEnv.extend);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'target-environment-variables',
      loadedVariables,
      target,
      buildType
    );
    expect(dotEnvUtils.inject).toHaveBeenCalledTimes(0);
  });

  it('should throw an error when requesting the files to copy of a target without bundling', () => {
    // Given
    const dotEnvUtils = 'dotEnvUtils';
    const events = 'events';
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = jest.fn();
    const utils = 'utils';
    const target = {
      name: 'my-target',
      bundle: false,
      is: {
        node: true,
      },
    };
    let sut = null;
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(() => sut.getFilesToCopy(target))
    .toThrow(/Only targets that require bundling can copy files/i);
  });

  it('should throw an error when generating a list of files with one that doesn\'t exist', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((eventName, list) => list),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = jest.fn();
    const utils = 'utils';
    const file = 'some-file.json';
    const source = '/source/';
    const build = '/build/';
    const target = {
      name: 'my-target',
      bundle: true,
      is: {
        node: true,
      },
      paths: {
        source,
        build,
      },
      copy: [file],
    };
    const buildType = 'production';
    let sut = null;
    const expectedItem = {
      from: path.join(source, file),
      to: path.join(build, file),
    };
    const expectedList = [expectedItem];
    const expectedErrorPath = expectedItem.from.replace('.', '\\.');
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    // Then
    expect(() => sut.getFilesToCopy(target, buildType))
    .toThrow(new RegExp(`The file to copy doesn't exist: ${expectedErrorPath}`, 'i'));
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'target-copy-files',
      expectedList,
      target,
      buildType
    );
  });

  it('should generate the list of files to copy on the bundling process', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => true);
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const dotEnvUtils = 'dotEnvUtils';
    const events = {
      reduce: jest.fn((eventName, list) => list),
    };
    const environmentUtils = 'environmentUtils';
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const projectConfiguration = {
      targets: {},
      targetsTemplates: {},
      paths: {
        source: '',
        build: '',
      },
    };
    const rootRequire = jest.fn();
    const utils = 'utils';
    const fileOneName = 'some-file.json';
    const fileOne = `some-crazy/path/${fileOneName}`;
    const fileTwo = {
      from: 'from/some-other-file.txt',
      to: 'to/some-other-file.txt',
    };
    const source = '/source/';
    const build = '/build/';
    const target = {
      name: 'my-target',
      bundle: true,
      is: {
        node: true,
      },
      paths: {
        source,
        build,
      },
      copy: [
        fileOne,
        fileTwo,
      ],
    };
    let sut = null;
    let result = null;
    const expectedList = [
      {
        from: path.join(source, fileOne),
        to: path.join(build, fileOneName),
      },
      {
        from: path.join(source, fileTwo.from),
        to: path.join(build, fileTwo.to),
      },
    ];
    // When
    sut = new Targets(
      dotEnvUtils,
      events,
      environmentUtils,
      packageInfo,
      pathUtils,
      projectConfiguration,
      rootRequire,
      utils
    );
    result = sut.getFilesToCopy(target);
    // Then
    expect(result).toEqual(expectedList);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      'target-copy-files',
      expectedList,
      target,
      'development'
    );
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
    expect(sut.dotEnvUtils).toBe('dotEnvUtils');
    expect(sut.events).toBe('events');
    expect(sut.environmentUtils).toBe('environmentUtils');
    expect(sut.packageInfo).toBe('packageInfo');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.projectConfiguration).toEqual(projectConfiguration);
    expect(sut.rootRequire).toBe('rootRequire');
    expect(sut.utils).toBe('utils');
  });
});
