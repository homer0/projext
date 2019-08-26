const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHValidateAnalyze');

require('jasmine-expect');
const {
  CLISHValidateAnalyzeCommand,
  cliSHValidateAnalyzeCommand,
} = require('/src/services/cli/cliSHValidateAnalyze');

describe('services/cli:validate-analyze', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHValidateAnalyzeCommand(targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateAnalyzeCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.hidden).toBeTrue();
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should validate the target exists when executed', () => {
    // Given
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHValidateAnalyzeCommand(targets);
    result = sut.handle(target.name);
    // Then
    expect(result).toEqual(target);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target.name);
  });

  it('should validate the default target when no name is specified', () => {
    // Given
    const target = {
      name: 'some-target',
      is: {
        browser: true,
      },
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHValidateAnalyzeCommand(targets);
    result = sut.handle();
    // Then
    expect(result).toEqual(target);
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the target doesn\'t do bundling', () => {
    // Given
    const target = {
      name: 'some-target',
      is: {
        node: true,
      },
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
    };
    let sut = null;
    // When/Then
    sut = new CLISHValidateAnalyzeCommand(targets);
    expect(() => sut.handle()).toThrow(/doesn't do bundling/i);
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
    cliSHValidateAnalyzeCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHValidateAnalyzeCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHValidateAnalyzeCommand);
    expect(sut.targets).toBe('targets');
  });
});
