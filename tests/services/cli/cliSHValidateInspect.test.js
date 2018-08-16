const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHValidateInspect');

require('jasmine-expect');
const {
  CLISHValidateInspectCommand,
  cliSHValidateInspectCommand,
} = require('/src/services/cli/cliSHValidateInspect');

describe('services/cli:validate-inspect', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHValidateInspectCommand(targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateInspectCommand);
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
        browser: false,
      },
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHValidateInspectCommand(targets);
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
        browser: false,
      },
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHValidateInspectCommand(targets);
    result = sut.handle();
    // Then
    expect(result).toEqual(target);
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when the target type is not Node', () => {
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
    // When/Then
    sut = new CLISHValidateInspectCommand(targets);
    expect(() => sut.handle()).toThrow(/is not a Node target/i);
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
    cliSHValidateInspectCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHValidateInspectCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHValidateInspectCommand);
    expect(sut.targets).toBe('targets');
  });
});
