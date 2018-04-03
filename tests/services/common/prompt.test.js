const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('prompt');
jest.unmock('/src/services/common/prompt');

require('jasmine-expect');
const promptTool = require('prompt');
const {
  Prompt,
  prompt,
  appPrompt,
} = require('/src/services/common/prompt');

describe('services/common:prompt', () => {
  beforeEach(() => {
    promptTool.message = 'originalMesage';
    promptTool.delimiter = 'originalDelimiter';
    promptTool.colors = true;
    promptTool.history.mockReset();
    promptTool.get.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    let sut = null;
    // When
    sut = new Prompt();
    // Then
    expect(sut).toBeInstanceOf(Prompt);
    expect(promptTool.message).toBeEmptyString();
    expect(promptTool.delimiter).toBe(' ');
    expect(promptTool.colors).toBeFalse();
  });

  it('should return information from the prompt tool history', () => {
    // Given
    const message = 'Hello Charito!';
    promptTool.history.mockReturnValueOnce(message);
    const key = 'message';
    let sut = null;
    let result = null;
    // When
    sut = new Prompt();
    result = sut.history(key);
    // Then
    expect(result).toBe(message);
    expect(promptTool.history).toHaveBeenCalledTimes(1);
    expect(promptTool.history).toHaveBeenCalledWith(key);
  });

  it('should return a saved value from the prompt tool history', () => {
    // Given
    const info = {
      value: 'Hello Charito!',
    };
    promptTool.history.mockReturnValueOnce(info);
    const key = 'message';
    let sut = null;
    let result = null;
    // When
    sut = new Prompt();
    result = sut.getValue(key);
    // Then
    expect(result).toBe(info.value);
    expect(promptTool.history).toHaveBeenCalledTimes(1);
    expect(promptTool.history).toHaveBeenCalledWith(key);
  });

  it('shouldn\'t return anything if the information is not on the prompt tool history', () => {
    // Given
    const key = 'message';
    let sut = null;
    let result = null;
    // When
    sut = new Prompt();
    result = sut.getValue(key);
    // Then
    expect(result).toBeUndefined();
    expect(promptTool.history).toHaveBeenCalledTimes(1);
    expect(promptTool.history).toHaveBeenCalledWith(key);
  });

  it('should ask the user for information using the prompt tool', () => {
    // Given
    const message = 'Done!';
    promptTool.get.mockImplementationOnce((info, callback) => {
      callback(null, message);
    });
    const schema = {
      name: {
        description: 'Some name',
      },
    };
    let sut = null;
    // When
    sut = new Prompt();
    return sut.ask(schema)
    .then((result) => {
      // Then
      expect(result).toBe(message);
      expect(promptTool.get).toHaveBeenCalledTimes(1);
      expect(promptTool.get).toHaveBeenCalledWith(
        { properties: schema },
        expect.any(Function)
      );
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should ask the user for information an reformat a boolean property', () => {
    // Given
    const message = 'Done!';
    promptTool.get.mockImplementationOnce((info, callback) => {
      callback(null, message);
    });
    const schema = {
      name: {
        description: 'Some name',
      },
      isSaturday: {
        type: 'boolean',
        description: 'is saturday?',
      },
    };
    const booleanCases = {
      YES: true,
      Yes: true,
      yes: true,
      Y: true,
      y: true,
      NO: false,
      No: false,
      no: false,
      N: false,
      n: false,
    };
    let sut = null;
    let booleanConform = null;
    let booleanBefore = null;
    const expectedSchema = {
      properties: {
        name: schema.name,
        isSaturday: Object.assign({}, schema.isSaturday, {
          type: 'string',
          message: expect.stringMatching(/you can only answer with 'yes' or 'no'/i),
          conform: expect.any(Function),
          before: expect.any(Function),
        }),
      },
    };
    // When
    sut = new Prompt();
    return sut.ask(schema)
    .then((result) => {
      // Then
      expect(result).toBe(message);
      expect(promptTool.get).toHaveBeenCalledTimes(1);
      expect(promptTool.get).toHaveBeenCalledWith(
        expectedSchema,
        expect.any(Function)
      );

      const [[{ properties: { isSaturday } }]] = promptTool.get.mock.calls;
      booleanConform = isSaturday.conform;
      booleanBefore = isSaturday.before;
      Object.keys(booleanCases).forEach((booleanCase) => {
        expect(booleanConform(booleanCase)).toBeTrue();
        expect(booleanBefore(booleanCase)).toBe(booleanCases[booleanCase]);
      });
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail while trying to ask the user for information using the prompt tool', () => {
    // Given
    const error = new Error('Something went terribly wrong!');
    promptTool.get.mockImplementationOnce((info, callback) => {
      callback(error, null);
    });
    const schema = {
      name: {
        description: 'Some name',
      },
    };
    let sut = null;
    // When
    sut = new Prompt();
    return sut.ask(schema)
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBe(error);
      expect(promptTool.get).toHaveBeenCalledTimes(1);
      expect(promptTool.get).toHaveBeenCalledWith(
        { properties: schema },
        expect.any(Function)
      );
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    const app = {
      set: jest.fn(),
    };
    let sut = null;
    let serviceName = null;
    let serviceFn = null;
    // When
    prompt(app);
    [[serviceName, serviceFn]] = app.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('prompt');
    expect(sut).toBeInstanceOf(Prompt);
  });

  it('should include a provider to register the app prompt with the package name as prefix', () => {
    // Given
    const info = {
      name: 'my-app',
    };
    const app = {
      get: jest.fn(() => info),
      set: jest.fn(),
    };
    let sut = null;
    let serviceName = null;
    let serviceFn = null;
    // When
    appPrompt(app);
    [[serviceName, serviceFn]] = app.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('appPrompt');
    expect(sut).toBeInstanceOf(Prompt);
    expect(promptTool.message).toBe(info.name);
  });

  it('should include a provider to register the app prompt with a custom prefix', () => {
    // Given
    const info = {
      name: 'my-app',
      nameForCLI: 'myApp',
    };
    const app = {
      get: jest.fn(() => info),
      set: jest.fn(),
    };
    let sut = null;
    let serviceName = null;
    let serviceFn = null;
    // When
    appPrompt(app);
    [[serviceName, serviceFn]] = app.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('appPrompt');
    expect(sut).toBeInstanceOf(Prompt);
    expect(promptTool.message).toBe(info.nameForCLI);
  });
});
