const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliGenerate');

require('jasmine-expect');
const {
  CLIGenerateCommand,
  cliGenerateCommand,
} = require('/src/services/cli/cliGenerate');

describe('services/cli:generate', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new CLIGenerateCommand();
    // Then
    expect(sut).toBeInstanceOf(CLIGenerateCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should register new generators', () => {
    // Given
    const generatorOne = {
      resource: 'js',
      description: 'generatorOneDescription',
      getHelpInformation: jest.fn(() => generatorOne.description),
    };
    const generatorTwo = {
      resource: 'jsx',
      description: 'generatorTwoDescription',
      getHelpInformation: jest.fn(() => generatorTwo.description),
    };
    const generators = [generatorOne, generatorTwo];
    let sut = null;
    const expectedDescription = 'Generate a projext resource:' +
      `${generatorOne.description}` +
      `${generatorTwo.description}`;
    // When
    sut = new CLIGenerateCommand();
    sut.addGenerators(generators);
    // Then
    expect(sut.generators[generatorOne.resource]).toEqual(generatorOne);
    expect(generatorOne.getHelpInformation).toHaveBeenCalledTimes(1);
    expect(sut.generators[generatorTwo.resource]).toEqual(generatorTwo);
    expect(generatorTwo.getHelpInformation).toHaveBeenCalledTimes(1);
    expect(sut.fullDescription).toBe(expectedDescription);
  });

  it('should call a generator when executed', () => {
    // Given
    const generatorOptions = {
      target: {
        instruction: '-t, --target [name]',
      },
      buildType: {
        instruction: '-bt, --build-type [type]',
        defaultValue: 'development',
      },
      run: {
        instruction: '-r, --run',
        defaultValue: false,
      },
    };
    const message = 'Done!';
    const generator = {
      resource: 'js',
      getHelpInformation: jest.fn(() => 'description'),
      generate: jest.fn(() => message),
      optionsByName: generatorOptions,
      options: Object.keys(generatorOptions),
    };
    const unknownOptions = {
      t: 'my-target',
      r: true,
      run: false,
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLIGenerateCommand();
    sut.addGenerators([generator]);
    result = sut.handle(generator.resource, {}, {}, unknownOptions);
    // Then
    expect(result).toBe(message);
    expect(generator.generate).toHaveBeenCalledTimes(1);
    expect(generator.generate).toHaveBeenCalledWith({
      target: unknownOptions.t,
      buildType: generatorOptions.buildType.defaultValue,
      run: unknownOptions.r,
    });
  });

  it('should throw an error when trying to generate an invalid resource', () => {
    // Given
    let sut = null;
    // When
    sut = new CLIGenerateCommand();
    return sut.handle('lala')
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((result) => {
      // Then
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toMatch(/invalid resource type/i);
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cliGenerateCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliGenerateCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIGenerateCommand);
  });
});
