const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/common/babelHelper');

require('jasmine-expect');

const { BabelHelper, babelHelper } = require('/src/services/common/babelHelper');

describe('services/common:babelHelper', () => {
  it('should add a plugin to a Babel configuration', () => {
    // Given
    const configurationInitialValue = {};
    const configuration = Object.assign({}, configurationInitialValue);
    const plugin = 'external-helpers';
    let result = null;
    const expectedConfiguration = {
      plugins: [
        plugin,
      ],
    };
    // When
    result = BabelHelper.addPlugin(configuration, plugin);
    // Then
    expect(result).toEqual(expectedConfiguration);
    expect(configuration).toEqual(configurationInitialValue);
  });

  it('should add a plugin with options to a Babel configuration', () => {
    // Given
    const configurationInitialValue = {};
    const configuration = Object.assign({}, configurationInitialValue);
    const plugin = ['external-helpers', { custom: true }];
    let result = null;
    const expectedConfiguration = {
      plugins: [
        plugin,
      ],
    };
    // When
    result = BabelHelper.addPlugin(configuration, plugin);
    // Then
    expect(result).toEqual(expectedConfiguration);
    expect(configuration).toEqual(configurationInitialValue);
  });

  it('should add a list of plugins to a Babel configuration', () => {
    // Given
    const configuration = {};
    const pluginOne = 'external-helpers';
    const pluginTwo = 'other-plugin';
    let result = null;
    const expectedConfiguration = {
      plugins: [
        pluginOne,
        pluginTwo,
      ],
    };
    // When
    result = BabelHelper.addPlugin(configuration, [pluginOne, pluginTwo]);
    // Then
    expect(result).toEqual(expectedConfiguration);
  });

  it('should add a plugin to an existing list of plugins', () => {
    // Given
    const configuration = {
      plugins: [
        'external-helpers',
        ['angularjs-annotate', { explicitOnly: true }],
      ],
    };
    const plugin = 'transform-jsx';
    let result = null;
    const expectedConfiguration = Object.assign({}, configuration, {
      plugins: [
        ...configuration.plugins,
        plugin,
      ],
    });
    // When
    result = BabelHelper.addPlugin(configuration, plugin);
    // Then
    expect(result).toEqual(expectedConfiguration);
  });

  it('should add two plugins to an existing list of plugins', () => {
    // Given
    const configuration = {
      plugins: [
        'external-helpers',
        ['angularjs-annotate', { explicitOnly: true }],
      ],
    };
    const pluginOne = 'other-helpers';
    const pluginTwo = ['other-plugin', { option: 'value' }];
    let result = null;
    const expectedConfiguration = {
      plugins: [
        ...configuration.plugins,
        pluginOne,
        pluginTwo,
      ],
    };
    // When
    result = BabelHelper.addPlugin(configuration, [pluginOne, pluginTwo]);
    // Then
    expect(result).toEqual(expectedConfiguration);
  });

  it('shouldn\'t add a plugin that is already on the configuration', () => {
    // Given
    const pluginOne = 'external-helpers';
    const pluginTwo = ['angularjs-annotate', { explicitOnly: true }];
    const configuration = {
      plugins: [
        pluginOne,
        pluginTwo,
      ],
    };
    let result = null;
    // When
    result = BabelHelper.addPlugin(configuration, [pluginOne, pluginTwo]);
    // Then
    expect(result).toEqual(configuration);
  });


  it('should add a preset to a Babel configuration', () => {
    // Given
    const configurationInitialValue = {};
    const configuration = Object.assign({}, configurationInitialValue);
    const preset = 'react-preset';
    let result = null;
    const expectedConfiguration = {
      presets: [
        preset,
      ],
    };
    // When
    result = BabelHelper.addPreset(configuration, preset);
    // Then
    expect(result).toEqual(expectedConfiguration);
    expect(configuration).toEqual(configurationInitialValue);
  });

  it('should add a preset with options to a Babel configuration', () => {
    // Given
    const configurationInitialValue = {};
    const configuration = Object.assign({}, configurationInitialValue);
    const preset = ['react-preset', { jsx: 'awesome' }];
    let result = null;
    const expectedConfiguration = {
      presets: [
        preset,
      ],
    };
    // When
    result = BabelHelper.addPreset(configuration, preset);
    // Then
    expect(result).toEqual(expectedConfiguration);
    expect(configuration).toEqual(configurationInitialValue);
  });

  it('should add a list of presets to a Babel configuration', () => {
    // Given
    const configuration = {};
    const presetOne = 'react-preset';
    const presetTwo = 'angularjs-preset';
    let result = null;
    const expectedConfiguration = {
      presets: [
        presetOne,
        presetTwo,
      ],
    };
    // When
    result = BabelHelper.addPreset(configuration, [presetOne, presetTwo]);
    // Then
    expect(result).toEqual(expectedConfiguration);
  });

  it('should add a preset to an existing list of presets', () => {
    // Given
    const configuration = {
      presets: [
        'react-preset',
        ['preact-preset', { cool: true }],
      ],
    };
    const preset = 'angularjs-preset';
    let result = null;
    const expectedConfiguration = Object.assign({}, configuration, {
      presets: [
        ...configuration.presets,
        preset,
      ],
    });
    // When
    result = BabelHelper.addPreset(configuration, preset);
    // Then
    expect(result).toEqual(expectedConfiguration);
  });

  it('should add two presets to an existing list of presets', () => {
    // Given
    const configuration = {
      presets: [
        'react-preset',
        ['preact-preset', { cool: true }],
      ],
    };
    const presetOne = 'angularjs-preset';
    const presetTwo = ['aurelia-preset', { option: 'value' }];
    let result = null;
    const expectedConfiguration = {
      presets: [
        ...configuration.presets,
        presetOne,
        presetTwo,
      ],
    };
    // When
    result = BabelHelper.addPreset(configuration, [presetOne, presetTwo]);
    // Then
    expect(result).toEqual(expectedConfiguration);
  });

  it('shouldn\'t add a preset that is already on the configuration', () => {
    // Given
    const presetOne = 'react-preset';
    const presetTwo = ['preact-annotate', { cool: true }];
    const configuration = {
      presets: [
        presetOne,
        presetTwo,
      ],
    };
    let result = null;
    // When
    result = BabelHelper.addPreset(configuration, [presetOne, presetTwo]);
    // Then
    expect(result).toEqual(configuration);
  });

  it('should add the env preset with custom options', () => {
    // Given
    const configurationInitialValue = {};
    const configuration = Object.assign({}, configurationInitialValue);
    const extraOptions = { extra: 'value' };
    let result = null;
    const expectedConfiguration = {
      presets: [
        ['env', extraOptions],
      ],
    };
    // When
    result = BabelHelper.updateEnvPreset(configuration, () => extraOptions);
    // Then
    expect(configuration).toEqual(configurationInitialValue);
    expect(result).toEqual(expectedConfiguration);
  });

  it('should update the options of an existing env preset', () => {
    // Given
    const defaultOptions = { modules: false };
    const configurationInitialValue = {
      presets: [
        ['env', defaultOptions],
      ],
    };
    const configuration = Object.assign({}, configurationInitialValue);
    const extraOptions = { extra: 'value' };
    let result = null;
    const expectedConfiguration = {
      presets: [
        ['env', Object.assign({}, defaultOptions, extraOptions)],
      ],
    };
    // When
    result = BabelHelper.updateEnvPreset(
      configuration,
      (currentOptions) => Object.assign({}, currentOptions, extraOptions)
    );
    // Then
    expect(configuration).toEqual(configurationInitialValue);
    expect(result).toEqual(expectedConfiguration);
  });

  it('shouldn\'t update the env preset if is not on the presets list', () => {
    // Given
    const configuration = {
      presets: [
        'some-preset',
        ['some-other-preset', {}],
      ],
    };
    let result = null;
    // When
    result = BabelHelper.updateEnvPreset(configuration, () => {});
    // Then
    expect(result).toEqual(configuration);
  });

  it('should add a required feature to the env preset', () => {
    // Given
    const configurationInitialValue = {};
    const configuration = Object.assign({}, configurationInitialValue);
    const feature = 'transform-es2015-arrow-functions';
    let result = null;
    const expectedConfiguration = {
      presets: [
        [
          'env',
          {
            include: [feature],
          },
        ],
      ],
    };
    // When
    result = BabelHelper.addEnvPresetFeature(configuration, feature);
    // Then
    expect(configuration).toEqual(configurationInitialValue);
    expect(result).toEqual(expectedConfiguration);
  });

  it('should add a list of required features to the env preset', () => {
    // Given
    const configuration = {};
    const features = [
      'transform-es2015-arrow-functions',
      'transform-es2015-classes',
      'transform-es2015-parameters',
    ];
    let result = null;
    const expectedConfiguration = {
      presets: [
        [
          'env',
          {
            include: features,
          },
        ],
      ],
    };
    // When
    result = BabelHelper.addEnvPresetFeature(configuration, features);
    // Then
    expect(result).toEqual(expectedConfiguration);
  });

  it('shouldn\'t add a feature that is already on the env preset', () => {
    // Given
    const feature = 'transform-es2015-arrow-functions';
    const configuration = {
      presets: [
        [
          'env',
          {
            include: [feature],
          },
        ],
      ],
    };
    let result = null;
    // When
    result = BabelHelper.addEnvPresetFeature(configuration, feature);
    // Then
    expect(result).toEqual(configuration);
  });

  it('should disable the `modules` option of the env preset', () => {
    // Given
    const configurationInitialValue = {};
    const configuration = Object.assign({}, configurationInitialValue);
    let result = null;
    const expectedConfiguration = {
      presets: [
        [
          'env',
          {
            modules: false,
          },
        ],
      ],
    };
    // When
    result = BabelHelper.disableEnvPresetModules(configuration);
    // Then
    expect(configuration).toEqual(configurationInitialValue);
    expect(result).toEqual(expectedConfiguration);
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    babelHelper(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('babelHelper');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBe(BabelHelper);
  });
});
