const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/cli/generators/projectConfigurationFile');

require('jasmine-expect');

const fs = require('fs-extra');
const {
  ProjectConfigurationFileGenerator,
  projectConfigurationFileGenerator,
} = require('/src/services/cli/generators/projectConfigurationFile');

describe('services/cli/generators:config', () => {
  beforeEach(() => {
    fs.pathExistsSync.mockReset();
    fs.writeFile.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const appPrompt = 'appPrompt';
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const utils = 'utils';
    let sut = null;
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    // Then
    expect(sut).toBeInstanceOf(ProjectConfigurationFileGenerator);
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.appPrompt).toBe(appPrompt);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.utils).toBe(utils);
  });

  it('should generate a configuration file', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      filename: 'projext.config.js',
      overwrite: true,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      targetsTemplates: {
        brower: {
          type: 'browser',
          some: 'va\'l\'ue',
        },
        node: {
          type: 'node',
          something: 'else',
        },
      },
      files: [
        'a.js',
        'b.html',
        'c.css',
      ],
    };
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    let sut = null;
    const expectedConfiguration = 'module.exports = ' +
      '{\n' +
      '  targetsTemplates: {\n' +
      '    brower: {\n' +
      '      type: \'browser\',\n' +
      '      some: \'va\\\'l\\\'ue\',\n' +
      '    },\n' +
      '    node: {\n' +
      '      type: \'node\',\n' +
      '      something: \'else\',\n' +
      '    },\n' +
      '  },\n' +
      '  files: [\n' +
      '    \'a.js\',\n' +
      '    \'b.html\',\n' +
      '    \'c.css\',\n' +
      '  ],\n' +
      '};\n';
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(utils.humanReadableList).toHaveBeenCalledTimes(1);
      expect(utils.humanReadableList).toHaveBeenCalledWith([
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ].map((file) => `'${file}'`));
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        filename: {
          default: 'projext.config.js',
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
          before: expect.any(Function),
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(input.filename);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(input.filename);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(input.filename, expectedConfiguration);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should generate a configuration file that overwrites an existing one', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      filename: 'projext.config.js',
      overwrite: true,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {
      targetsTemplates: {
        brower: {
          type: 'browser',
          some: 'va\'l\'ue',
        },
        node: {
          type: 'node',
          something: 'else',
        },
      },
      files: [
        'a.js',
        'b.html',
        'c.css',
      ],
    };
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    let sut = null;
    const expectedConfiguration = 'module.exports = ' +
      '{\n' +
      '  targetsTemplates: {\n' +
      '    brower: {\n' +
      '      type: \'browser\',\n' +
      '      some: \'va\\\'l\\\'ue\',\n' +
      '    },\n' +
      '    node: {\n' +
      '      type: \'node\',\n' +
      '      something: \'else\',\n' +
      '    },\n' +
      '  },\n' +
      '  files: [\n' +
      '    \'a.js\',\n' +
      '    \'b.html\',\n' +
      '    \'c.css\',\n' +
      '  ],\n' +
      '};\n';
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(utils.humanReadableList).toHaveBeenCalledTimes(1);
      expect(utils.humanReadableList).toHaveBeenCalledWith([
        'projext.config.js',
        'config/projext.config.js',
        'config/project.config.js',
      ].map((file) => `'${file}'`));
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        filename: {
          default: 'projext.config.js',
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
          before: expect.any(Function),
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(input.filename);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(input.filename);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(input.filename, expectedConfiguration);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('shouldn\'t do anything if the user chooses not to overwrite an existing file', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      filename: 'projext.config.js',
      overwrite: false,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = 'projectConfiguration';
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    let sut = null;
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        filename: {
          default: 'projext.config.js',
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
          before: expect.any(Function),
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(pathUtils.join).toHaveBeenCalledTimes(1);
      expect(pathUtils.join).toHaveBeenCalledWith(input.filename);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(input.filename);
      expect(fs.writeFile).toHaveBeenCalledTimes(0);
      expect(appLogger.success).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('shouldn\'t do anything if the user cancels the input', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
    };
    const error = new Error('canceled');
    const appPrompt = {
      ask: jest.fn(() => Promise.reject(error)),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    let sut = null;
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        filename: {
          default: 'projext.config.js',
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
          before: expect.any(Function),
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(0);
      expect(fs.writeFile).toHaveBeenCalledTimes(0);
      expect(appLogger.success).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to generate a configuration file', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
      error: jest.fn(),
    };
    const error = new Error('Something went wrong');
    const appPrompt = {
      ask: jest.fn(() => Promise.reject(error)),
    };
    const pathUtils = 'pathUtils';
    const projectConfiguration = 'projectConfiguration';
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    let sut = null;
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBe(error);
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        filename: {
          default: 'projext.config.js',
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
          before: expect.any(Function),
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(0);
      expect(fs.writeFile).toHaveBeenCalledTimes(0);
      expect(appLogger.success).toHaveBeenCalledTimes(0);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(appLogger.error).toHaveBeenCalledWith(
        expect.stringMatching(/there was an error while generating the configuration file/i)
      );
    });
  });

  it('should validate the name of the selected filename', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      filename: 'projext.config.js',
      overwrite: true,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {};
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    const validationCases = {
      'projext.config.js': true,
      'config/projext.config.js': true,
      'config/project.config.js': true,
      'my-config.js': false,
      'projext.js': false,
      'charito.js': false,
    };
    let sut = null;
    let fileValidation = null;
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      // Then
      [[{ filename: { conform: fileValidation } }]] = appPrompt.ask.mock.calls;
      Object.keys(validationCases).forEach((file) => {
        expect(fileValidation(file)).toBe(validationCases[file]);
      });
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should format the selected filename into lower case', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      filename: 'projext.config.js',
      overwrite: true,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {};
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    const validationCases = [
      'proJEXT.confIG.js',
      'confIG/projext.config.JS',
      'CONFIG/PROJECT.CONFIG.JS',
    ];
    let sut = null;
    let fileFormatter = null;
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      // Then
      [[{ filename: { before: fileFormatter } }]] = appPrompt.ask.mock.calls;
      validationCases.forEach((file) => {
        expect(fileFormatter(file)).toBe(file.toLowerCase());
      });
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should only ask to overwrite when the file already exists', () => {
    // Given
    // 1 - When validating on the resolved promise.
    fs.pathExistsSync.mockReturnValueOnce(false);
    // 2 - When validating on the `overwrite.ask` function.
    const askReturn = true;
    fs.pathExistsSync.mockReturnValueOnce(askReturn);
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      filename: 'projext.config.js',
      overwrite: true,
    };
    const inputValue = 'somer-random-value';
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
      getValue: jest.fn(() => inputValue),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const projectConfiguration = {};
    const utils = {
      humanReadableList: jest.fn((list) => list.join(', ')),
    };
    let sut = null;
    let overwriteValidation = null;
    const expectedPathChecks = [
      input.filename,
      inputValue,
    ];
    // When
    sut = new ProjectConfigurationFileGenerator(
      appLogger,
      appPrompt,
      pathUtils,
      projectConfiguration,
      utils
    );
    return sut.generate()
    .then(() => {
      // Then
      [[{ overwrite: { ask: overwriteValidation } }]] = appPrompt.ask.mock.calls;
      expect(overwriteValidation()).toBe(askReturn);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(expectedPathChecks.length);
      expectedPathChecks.forEach((check) => {
        expect(fs.pathExistsSync).toHaveBeenCalledWith(check);
      });
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
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
    projectConfigurationFileGenerator(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('projectConfigurationFileGenerator');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(ProjectConfigurationFileGenerator);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.appPrompt).toBe('appPrompt');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
    expect(sut.utils).toBe('utils');
  });
});
