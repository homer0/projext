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

  it('should be instantiated with all its dependencies', () => {
    // Given
    const projectConfigurationFileGenerator = 'projectConfigurationFileGenerator';
    const targetHTMLGenerator = 'targetHTMLGenerator';
    let sut = null;
    // When
    sut = new CLIGenerateCommand(projectConfigurationFileGenerator, targetHTMLGenerator);
    // Then
    expect(sut).toBeInstanceOf(CLIGenerateCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.generators.config).toBe(projectConfigurationFileGenerator);
    expect(sut.generators.html).toBe(targetHTMLGenerator);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.fullDescription).not.toBeEmptyString();
  });

  it('should call the configuration generator when executed', () => {
    // Given
    const message = 'Done!';
    const projectConfigurationFileGenerator = {
      generate: jest.fn(() => message),
    };
    const targetHTMLGenerator = 'targetHTMLGenerator';
    let sut = null;
    let result = null;
    // When
    sut = new CLIGenerateCommand(projectConfigurationFileGenerator, targetHTMLGenerator);
    result = sut.handle('config');
    // Then
    expect(result).toBe(message);
    expect(projectConfigurationFileGenerator.generate).toHaveBeenCalledTimes(1);
  });

  it('should call the configuration generator when executed', () => {
    // Given
    const message = 'Done!';
    const projectConfigurationFileGenerator = 'projectConfigurationFileGenerator';
    const targetHTMLGenerator = {
      generate: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLIGenerateCommand(projectConfigurationFileGenerator, targetHTMLGenerator);
    result = sut.handle('html');
    // Then
    expect(result).toBe(message);
    expect(targetHTMLGenerator.generate).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when trying to generate an invalid resource', () => {
    // Given
    const projectConfigurationFileGenerator = 'projectConfigurationFileGenerator';
    const targetHTMLGenerator = 'targetHTMLGenerator';
    let sut = null;
    // When
    sut = new CLIGenerateCommand(projectConfigurationFileGenerator, targetHTMLGenerator);
    // Then
    expect(() => sut.handle('lala')).toThrow(/invalid resource type/i);
  });

  it('should throw an error when executed without a resource type', () => {
    // Given
    const projectConfigurationFileGenerator = 'projectConfigurationFileGenerator';
    const targetHTMLGenerator = 'targetHTMLGenerator';
    let sut = null;
    // When
    sut = new CLIGenerateCommand(projectConfigurationFileGenerator, targetHTMLGenerator);
    // Then
    expect(() => sut.handle()).toThrow(/invalid resource type/i);
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
    cliGenerateCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliGenerateCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIGenerateCommand);
    expect(sut.generators.config).toBe('projectConfigurationFileGenerator');
    expect(sut.generators.html).toBe('targetHTMLGenerator');
  });
});
