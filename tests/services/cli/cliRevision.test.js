const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliRevision');

require('jasmine-expect');
const {
  CLIRevisionCommand,
  cliRevisionCommand,
} = require('/src/services/cli/cliRevision');

describe('services/cli:revision', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildVersion = 'buildVersion';
    let sut = null;
    // When
    sut = new CLIRevisionCommand(buildVersion);
    // Then
    expect(sut).toBeInstanceOf(CLIRevisionCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.buildVersion).toBe(buildVersion);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
  });

  it('should call the method to create the revision file when executed', () => {
    // Given
    const message = 'done!';
    const buildVersion = {
      createRevision: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLIRevisionCommand(buildVersion);
    result = sut.handle();
    // Then
    expect(result).toBe(message);
    expect(buildVersion.createRevision).toHaveBeenCalledTimes(1);
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
    cliRevisionCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliRevisionCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLIRevisionCommand);
    expect(sut.buildVersion).toBe('buildVersion');
  });
});
