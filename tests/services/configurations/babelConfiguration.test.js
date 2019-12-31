const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/configurations/babelConfiguration');

require('jasmine-expect');
const {
  BabelConfiguration,
  babelConfiguration,
} = require('/src/services/configurations/babelConfiguration');

describe('services/configurations:babelConfiguration', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    let sut = null;
    // When
    sut = new BabelConfiguration(events);
    // Then
    expect(sut).toBeInstanceOf(BabelConfiguration);
    expect(sut.events).toBe(events);
  });

  it('should create a Babel configuration for a browser target', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const browserVersions = 2;
    const target = {
      is: {
        browser: true,
      },
      babel: {
        browserVersions,
        features: {},
        mobileSupport: true,
        overwrites: {},
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            browsers: [
              `last ${browserVersions} chrome versions`,
              `last ${browserVersions} safari versions`,
              `last ${browserVersions} edge versions`,
              `last ${browserVersions} firefox versions`,
              `last ${browserVersions} ios versions`,
              `last ${browserVersions} android versions`,
            ],
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should include custom settings for the env preset', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const browserVersions = 2;
    const env = {
      corejs: 4,
      modules: false,
      useBuiltIns: 'entry',
    };
    const target = {
      is: {
        browser: true,
      },
      babel: {
        browserVersions,
        features: {},
        mobileSupport: true,
        overwrites: {},
        env,
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        Object.assign(
          {
            targets: {
              browsers: [
                `last ${browserVersions} chrome versions`,
                `last ${browserVersions} safari versions`,
                `last ${browserVersions} edge versions`,
                `last ${browserVersions} firefox versions`,
                `last ${browserVersions} ios versions`,
                `last ${browserVersions} android versions`,
              ],
            },
          },
          env
        ),
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create a Babel configuration for a browser target with polyfills', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const browserVersions = 2;
    const target = {
      is: {
        browser: true,
      },
      babel: {
        browserVersions,
        features: {},
        mobileSupport: true,
        overwrites: {},
        polyfill: true,
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        {
          corejs: 3,
          useBuiltIns: 'usage',
          targets: {
            browsers: [
              `last ${browserVersions} chrome versions`,
              `last ${browserVersions} safari versions`,
              `last ${browserVersions} edge versions`,
              `last ${browserVersions} firefox versions`,
              `last ${browserVersions} ios versions`,
              `last ${browserVersions} android versions`,
            ],
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('shouldn\'t overwrite browsers settings for the env preset', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const baseBrowsers = [
      'last 11 edge versions',
      'last 12 ios versions',
    ];
    const browserVersions = 2;
    const target = {
      is: {
        browser: true,
      },
      babel: {
        browserVersions,
        features: {},
        mobileSupport: true,
        overwrites: {},
        polyfill: true,
        env: {
          targets: {
            browsers: baseBrowsers,
          },
        },
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        {
          corejs: 3,
          useBuiltIns: 'usage',
          targets: {
            browsers: [
              ...baseBrowsers,
              `last ${browserVersions} chrome versions`,
              `last ${browserVersions} safari versions`,
              `last ${browserVersions} firefox versions`,
              `last ${browserVersions} android versions`,
            ],
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create browser settings for the env preset if the setting is not an array', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const browserVersions = 2;
    const target = {
      is: {
        browser: true,
      },
      babel: {
        browserVersions,
        features: {},
        mobileSupport: true,
        overwrites: {},
        env: {
          targets: {
            browsers: false,
          },
        },
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        {
          targets: {},
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create a Babel configuration for a browser target without mobile support', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const browserVersions = 2;
    const target = {
      is: {
        browser: true,
      },
      babel: {
        browserVersions,
        features: {},
        mobileSupport: false,
        overwrites: {},
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            browsers: [
              `last ${browserVersions} chrome versions`,
              `last ${browserVersions} safari versions`,
              `last ${browserVersions} edge versions`,
              `last ${browserVersions} firefox versions`,
            ],
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create a Babel configuration for a node target', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {},
        overwrites: {},
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            node: nodeVersion,
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('shouldn\'t overwrite a node target env version if it\'s already defined', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = '2509';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion: 'current',
        features: {},
        overwrites: {},
        env: {
          targets: {
            node: nodeVersion,
          },
        },
      },
      flow: false,
    };
    const expected = {
      plugins: [],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            node: nodeVersion,
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create a Babel configuration and include the `dynamic imports` feature', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          dynamicImports: true,
        },
        overwrites: {},
      },
      flow: false,
    };
    const expected = {
      plugins: ['@babel/plugin-syntax-dynamic-import'],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            node: nodeVersion,
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create a Babel configuration and include the `class properties` feature', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          dynamicImports: false,
          classProperties: true,
          unknownFeature: true,
        },
        overwrites: {},
      },
      flow: false,
    };
    const expected = {
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
      ],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            node: nodeVersion,
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create a Babel configuration and include the `decorators` feature', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          decorators: true,
        },
        overwrites: {},
      },
      flow: false,
    };
    const expected = {
      plugins: [
        ['@babel/plugin-proposal-decorators', {
          legacy: true,
        }],
      ],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            node: nodeVersion,
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should create a Babel configuration and include the `objectRestSpread` feature', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          objectRestSpread: true,
        },
        overwrites: {},
      },
      flow: false,
    };
    const expected = {
      plugins: ['@babel/plugin-proposal-object-rest-spread'],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            node: nodeVersion,
          },
        },
      ]],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('shouldn\'t add plugins or modify the env preset if it\'s already defined', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const overwrites = {
      plugins: [
        '@babel/plugin-proposal-decorators',
        '@babel/plugin-proposal-class-properties',
      ],
      presets: [[
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ]],
    };

    const target = {
      is: {
        browser: true,
      },
      babel: {
        features: {
          decorators: true,
        },
        overwrites,
      },
      flow: false,
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(overwrites);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, overwrites, target);
  });

  it('should push the Flow preset if the `flow` option is enabled', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          classProperties: true,
        },
      },
      flow: true,
    };
    const expected = {
      plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: nodeVersion,
          },
        }],
        ['@babel/preset-flow'],
      ],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('shouldn\'t push the Flow preset twice', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          classProperties: true,
        },
        overwrites: {
          presets: [['@babel/preset-flow']],
        },
      },
      flow: true,
    };
    const expected = {
      plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: nodeVersion,
          },
        }],
        ['@babel/preset-flow'],
      ],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should add the `properties` feature if the `flow` option is enabled', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {},
        overwrites: {},
      },
      flow: true,
    };
    const expected = {
      plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: nodeVersion,
          },
        }],
        ['@babel/preset-flow'],
      ],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should push the TypeScript preset if the `typeScript` option is enabled', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          classProperties: true,
          objectRestSpread: true,
        },
      },
      typeScript: true,
    };
    const expected = {
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-object-rest-spread',
      ],
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: nodeVersion,
          },
        }],
        ['@babel/preset-typescript', {}],
      ],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should enable the JSX options for TypeScript and React', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          classProperties: true,
          objectRestSpread: true,
        },
      },
      typeScript: true,
      framework: 'react',
    };
    const expected = {
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-object-rest-spread',
      ],
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: nodeVersion,
          },
        }],
        ['@babel/preset-typescript', {
          isTSX: true,
          allExtensions: true,
        }],
      ],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should push the TypeScript preset twice', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {
          classProperties: true,
          objectRestSpread: true,
        },
        overwrites: {
          presets: [['@babel/preset-typescript']],
        },
      },
      typeScript: true,
    };
    const expected = {
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-object-rest-spread',
      ],
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: nodeVersion,
          },
        }],
        ['@babel/preset-typescript'],
      ],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
  });

  it('should add the `properties` and `objectRestSpread` for TypeScript', () => {
    // Given
    const eventName = 'babel-configuration';
    const events = {
      reduce: jest.fn((name, config) => config),
    };
    const nodeVersion = 'current';
    const target = {
      is: {
        browser: false,
      },
      babel: {
        nodeVersion,
        features: {},
      },
      typeScript: true,
    };
    const expected = {
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-object-rest-spread',
      ],
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: nodeVersion,
          },
        }],
        ['@babel/preset-typescript', {}],
      ],
    };
    let sut = null;
    let result = null;
    // When
    sut = new BabelConfiguration(events);
    result = sut.getConfigForTarget(target);
    // Then
    expect(result).toEqual(expected);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(eventName, expected, target);
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
    babelConfiguration(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('babelConfiguration');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BabelConfiguration);
    expect(sut.events).toBe('events');
  });
});
