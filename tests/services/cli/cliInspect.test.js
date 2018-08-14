const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliInspect');

require('jasmine-expect');
const {
  CLIInspectCommand,
  cliInspectCommand,
} = require('/src/services/cli/cliInspect');

describe('services/cli:inspect', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new CLIInspectCommand();
    // Then
    expect(sut).toBeInstanceOf(CLIInspectCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.allowUnknownOptions).toBeTrue();
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
    cliInspectCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliInspectCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIInspectCommand);
  });
});
