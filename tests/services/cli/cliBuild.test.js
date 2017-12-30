const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliBuild');

require('jasmine-expect');
const {
  CLIBuildCommand,
  cliBuildCommand,
} = require('/src/services/cli/cliBuild');

describe('services/cli:build', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new CLIBuildCommand();
    // Then
    expect(sut).toBeInstanceOf(CLIBuildCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(2);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
    expect(sut.addOption).toHaveBeenCalledWith(
      'run',
      '-r, --run',
      expect.any(String),
      false
    );
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
    cliBuildCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliBuildCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIBuildCommand);
  });
});
