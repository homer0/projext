const JimpleMock = require('/tests/mocks/jimple.mock');
const CLIGeneratorSubCommandMock = require('/tests/mocks/cliGeneratorSubCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliGeneratorSubCommand', () => CLIGeneratorSubCommandMock);
jest.mock('fs-extra');
jest.unmock('/src/services/cli/generators/targetHTML');

require('jasmine-expect');

const fs = require('fs-extra');
const {
  TargetHTMLGenerator,
  targetHTMLGenerator,
} = require('/src/services/cli/generators/targetHTML');

describe('services/cli/generators:html', () => {
  beforeEach(() => {
    CLIGeneratorSubCommandMock.reset();
    fs.pathExistsSync.mockReset();
    fs.move.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const appLogger = 'appLogger';
    const appPrompt = 'appPrompt';
    const targets = 'targets';
    const targetsHTML = 'targetsHTML';
    let sut = null;
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
    );
    // Then
    expect(sut).toBeInstanceOf(TargetHTMLGenerator);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.resource).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.appLogger).toBe(appLogger);
    expect(sut.appPrompt).toBe(appPrompt);
    expect(sut.targets).toBe(targets);
    expect(sut.targetsHTML).toBe(targetsHTML);
  });

  it('should generate a browser target HTML file', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
    fs.move.mockImplementationOnce(() => Promise.resolve());
    const targetName = 'my-target';
    const target = {
      name: targetName,
      html: {
        template: 'index.html',
      },
      paths: {
        source: 'src',
      },
    };
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      target: targetName,
      filename: 'index.html',
      overwrite: true,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const targets = {
      getTarget: jest.fn(() => target),
      getDefaultTarget: jest.fn(() => target),
    };
    const tempFilepath = `tmp/${targetName}.html`;
    const targetsHTML = {
      getFilepath: jest.fn(() => tempFilepath),
    };
    let sut = null;
    const expectedFilepath = `${target.paths.source}/${input.filename}`;
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
      expect(targets.getDefaultTarget).toHaveBeenCalledWith('browser');
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        target: {
          default: target.name,
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
        },
        filename: {
          default: target.html.template,
          pattern: expect.any(RegExp),
          description: expect.any(String),
          message: expect.any(String),
          required: true,
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(expectedFilepath);
      expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
      expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target, true);
      expect(fs.move).toHaveBeenCalledTimes(1);
      expect(fs.move).toHaveBeenCalledWith(tempFilepath, expectedFilepath);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should generate a browser target HTML file that overwrites an existing one', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
    fs.move.mockImplementationOnce(() => Promise.resolve());
    const targetName = 'my-target';
    const target = {
      name: targetName,
      html: {
        template: 'index.html',
      },
      paths: {
        source: 'src',
      },
    };
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      target: targetName,
      filename: 'index.html',
      overwrite: true,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const targets = {
      getTarget: jest.fn(() => target),
      getDefaultTarget: jest.fn(() => target),
    };
    const tempFilepath = `tmp/${targetName}.html`;
    const targetsHTML = {
      getFilepath: jest.fn(() => tempFilepath),
    };
    let sut = null;
    const expectedFilepath = `${target.paths.source}/${input.filename}`;
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
      expect(targets.getDefaultTarget).toHaveBeenCalledWith('browser');
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        target: {
          default: target.name,
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
        },
        filename: {
          default: target.html.template,
          pattern: expect.any(RegExp),
          description: expect.any(String),
          message: expect.any(String),
          required: true,
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(expectedFilepath);
      expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(1);
      expect(targetsHTML.getFilepath).toHaveBeenCalledWith(target, true);
      expect(fs.move).toHaveBeenCalledTimes(1);
      expect(fs.move).toHaveBeenCalledWith(tempFilepath, expectedFilepath);
      expect(appLogger.success).toHaveBeenCalledTimes(1);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('shouldn\'t do anything if the user chooses not to overwrite an existing file', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
    fs.move.mockImplementationOnce(() => Promise.resolve());
    const targetName = 'my-target';
    const target = {
      name: targetName,
      html: {
        template: 'index.html',
      },
      paths: {
        source: 'src',
      },
    };
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      target: targetName,
      filename: 'index.html',
      overwrite: false,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const targets = {
      getTarget: jest.fn(() => target),
      getDefaultTarget: jest.fn(() => target),
    };
    const targetsHTML = {
      getFilepath: jest.fn(),
    };
    let sut = null;
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
      expect(targets.getDefaultTarget).toHaveBeenCalledWith('browser');
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        target: {
          default: target.name,
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
        },
        filename: {
          default: target.html.template,
          pattern: expect.any(RegExp),
          description: expect.any(String),
          message: expect.any(String),
          required: true,
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(targets.getTarget).toHaveBeenCalledTimes(1);
      expect(targets.getTarget).toHaveBeenCalledWith(target.name);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
      expect(fs.pathExistsSync).toHaveBeenCalledWith(`${target.paths.source}/${input.filename}`);
      expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(0);
      expect(fs.move).toHaveBeenCalledTimes(0);
      expect(appLogger.success).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('shouldn\'t do anything if the user cancels the input', () => {
    // Given
    const targetName = 'my-target';
    const target = {
      name: targetName,
      html: {
        template: 'index.html',
      },
      paths: {
        source: 'src',
      },
    };
    const appLogger = {
      success: jest.fn(),
    };
    const error = new Error('canceled');
    const appPrompt = {
      ask: jest.fn(() => Promise.reject(error)),
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
      getTarget: jest.fn(),
    };
    const targetsHTML = {
      getFilepath: jest.fn(),
    };
    let sut = null;
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
    );
    return sut.generate()
    .then(() => {
      // Then
      expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
      expect(targets.getDefaultTarget).toHaveBeenCalledWith('browser');
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        target: {
          default: target.name,
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
        },
        filename: {
          default: target.html.template,
          pattern: expect.any(RegExp),
          description: expect.any(String),
          message: expect.any(String),
          required: true,
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(targets.getTarget).toHaveBeenCalledTimes(0);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(0);
      expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(0);
      expect(fs.move).toHaveBeenCalledTimes(0);
      expect(appLogger.success).toHaveBeenCalledTimes(0);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to generate a browser target HTML file', () => {
    // Given
    const targetName = 'my-target';
    const target = {
      name: targetName,
      html: {
        template: 'index.html',
      },
      paths: {
        source: 'src',
      },
    };
    const appLogger = {
      success: jest.fn(),
      error: jest.fn(),
    };
    const error = new Error('Something went wrong');
    const appPrompt = {
      ask: jest.fn(() => Promise.reject(error)),
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
      getTarget: jest.fn(),
    };
    const targetsHTML = {
      getFilepath: jest.fn(),
    };
    let sut = null;
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
    );
    return sut.generate()
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBe(error);
      expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
      expect(targets.getDefaultTarget).toHaveBeenCalledWith('browser');
      expect(appPrompt.ask).toHaveBeenCalledTimes(1);
      expect(appPrompt.ask).toHaveBeenCalledWith({
        target: {
          default: target.name,
          description: expect.any(String),
          message: expect.any(String),
          required: true,
          conform: expect.any(Function),
        },
        filename: {
          default: target.html.template,
          pattern: expect.any(RegExp),
          description: expect.any(String),
          message: expect.any(String),
          required: true,
        },
        overwrite: {
          type: 'boolean',
          default: 'yes',
          description: expect.any(String),
          required: true,
          ask: expect.any(Function),
        },
      });
      expect(targets.getTarget).toHaveBeenCalledTimes(0);
      expect(fs.pathExistsSync).toHaveBeenCalledTimes(0);
      expect(targetsHTML.getFilepath).toHaveBeenCalledTimes(0);
      expect(fs.move).toHaveBeenCalledTimes(0);
      expect(appLogger.success).toHaveBeenCalledTimes(0);
      expect(appLogger.error).toHaveBeenCalledTimes(1);
      expect(appLogger.error).toHaveBeenCalledWith(
        expect.stringMatching(/there was an error while generating the HTML file/i)
      );
    });
  });

  it('should validate that the selected target is a browser target', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
    fs.move.mockImplementationOnce(() => Promise.resolve());
    const targetName = 'my-target';
    const target = {
      name: targetName,
      html: {
        template: 'index.html',
      },
      paths: {
        source: 'src',
      },
    };
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      target: targetName,
      filename: 'index.html',
      overwrite: true,
    };
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
    };
    const targetsCases = {
      targetOne: {
        exists: true,
        target: {
          is: {
            browser: true,
          },
        },
        expected: true,
      },
      targetTwo: {
        exists: false,
        expected: false,
      },
      targetThree: {
        exists: true,
        target: {
          is: {
            browser: false,
          },
        },
        expected: false,
      },
    };
    const targets = {
      targetExists: jest.fn((name) => targetsCases[name].exists),
      getTarget: jest.fn((name) => (targetsCases[name] ? targetsCases[name].target : target)),
      getDefaultTarget: jest.fn(() => target),
    };
    const tempFilepath = `tmp/${targetName}.html`;
    const targetsHTML = {
      getFilepath: jest.fn(() => tempFilepath),
    };
    let sut = null;
    let targetValidation = null;
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
    );
    return sut.generate()
    .then(() => {
      // Then
      [[{ target: { conform: targetValidation } }]] = appPrompt.ask.mock.calls;
      Object.keys(targetsCases).forEach((targetCaseName) => {
        const info = targetsCases[targetCaseName];
        expect(targetValidation(targetCaseName)).toBe(info.expected);
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
    fs.move.mockImplementationOnce(() => Promise.resolve());
    const targetName = 'my-target';
    const target = {
      name: targetName,
      html: {
        template: 'index.html',
      },
      paths: {
        source: 'src',
      },
    };
    const appLogger = {
      success: jest.fn(),
    };
    const input = {
      target: targetName,
      filename: 'index.html',
      overwrite: true,
    };
    const inputValue = 'somer-random-value';
    const appPrompt = {
      ask: jest.fn(() => Promise.resolve(input)),
      getValue: jest.fn(() => inputValue),
    };
    const targets = {
      getTarget: jest.fn(() => target),
      getDefaultTarget: jest.fn(() => target),
    };
    const tempFilepath = `tmp/${targetName}.html`;
    const targetsHTML = {
      getFilepath: jest.fn(() => tempFilepath),
    };
    let sut = null;
    let overwriteValidation = null;
    const expectedPathChecks = [
      `${target.paths.source}/${input.filename}`,
      `${target.paths.source}/${inputValue}`,
    ];
    // When
    sut = new TargetHTMLGenerator(
      appLogger,
      appPrompt,
      targets,
      targetsHTML
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
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    targetHTMLGenerator(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('targetHTMLGenerator');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(TargetHTMLGenerator);
    expect(sut.appLogger).toBe('appLogger');
    expect(sut.appPrompt).toBe('appPrompt');
    expect(sut.targets).toBe('targets');
    expect(sut.targetsHTML).toBe('targetsHTML');
  });
});
