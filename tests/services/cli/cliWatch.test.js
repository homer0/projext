const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliWatch');

require('jasmine-expect');
const {
  CLIWatchCommand,
  cliWatchCommand,
} = require('/src/services/cli/cliWatch');

describe('services/cli:watch', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new CLIWatchCommand();
    // Then
    expect(sut).toBeInstanceOf(CLIWatchCommand);
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
    cliWatchCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliWatchCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIWatchCommand);
  });
});
