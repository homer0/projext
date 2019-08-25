const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliAnalyze');

require('jasmine-expect');
const {
  CLIAnalyzeCommand,
  cliAnalyzeCommand,
} = require('/src/services/cli/cliAnalyze');

describe('services/cli:analyze', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new CLIAnalyzeCommand();
    // Then
    expect(sut).toBeInstanceOf(CLIAnalyzeCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(1);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
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
    cliAnalyzeCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliAnalyzeCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIAnalyzeCommand);
  });
});
