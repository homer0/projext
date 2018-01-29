const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliClean');

require('jasmine-expect');
const {
  CLICleanCommand,
  cliCleanCommand,
} = require('/src/services/cli/cliClean');

describe('services/cli:clean', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const builder = 'builder';
    const buildCleaner = 'buildCleaner';
    let sut = null;
    // When
    sut = new CLICleanCommand(builder, buildCleaner);
    // Then
    expect(sut).toBeInstanceOf(CLICleanCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.builder).toBe(builder);
    expect(sut.buildCleaner).toBe(buildCleaner);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
  });

  it('should call the method to clean a target files if it receives a target name', () => {
    // Given
    const target = 'some-target';
    const message = 'done';
    const builder = {
      cleanTarget: jest.fn(() => message),
    };
    const buildCleaner = 'buildCleaner';
    let sut = null;
    let result = null;
    // When
    sut = new CLICleanCommand(builder, buildCleaner);
    result = sut.handle(target);
    // Then
    expect(result).toBe(message);
    expect(builder.cleanTarget).toHaveBeenCalledTimes(1);
    expect(builder.cleanTarget).toHaveBeenCalledWith(target);
  });

  it('should call the method to clean everything if no target name is received', () => {
    // Given
    const message = 'done';
    const builder = 'builder';
    const buildCleaner = {
      cleanAll: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLICleanCommand(builder, buildCleaner);
    result = sut.handle();
    // Then
    expect(result).toBe(message);
    expect(buildCleaner.cleanAll).toHaveBeenCalledTimes(1);
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
    cliCleanCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliCleanCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLICleanCommand);
    expect(sut.builder).toBe('builder');
    expect(sut.buildCleaner).toBe('buildCleaner');
  });
});
