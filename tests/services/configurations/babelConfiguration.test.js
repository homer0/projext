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
        polyfill: true,
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
      plugins: ['@babel/plugin-proposal-class-properties'],
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
      plugins: ['@babel/plugin-proposal-decorators'],
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
      plugins: ['@babel/plugin-proposal-class-properties'],
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
      plugins: ['@babel/plugin-proposal-class-properties'],
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
