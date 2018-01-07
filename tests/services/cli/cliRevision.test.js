const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/cliCommand', () => CLICommandMock);
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
    const projectConfiguration = 'projectConfiguration';
    const versionUtils = 'versionUtils';
    let sut = null;
    // When
    sut = new CLIRevisionCommand(projectConfiguration, versionUtils);
    // Then
    expect(sut).toBeInstanceOf(CLIRevisionCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.versionUtils).toBe(versionUtils);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
  });

  it('should call the method to create the revision file when executed', () => {
    // Given
    const message = 'done';
    const revisionFilename = 'revision';
    const projectConfiguration = {
      version: {
        revision: {
          enabled: true,
          filename: revisionFilename,
        },
      },
    };
    const versionUtils = {
      createRevisionFile: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLIRevisionCommand(projectConfiguration, versionUtils);
    result = sut.handle();
    // Then
    expect(result).toBe(message);
    expect(versionUtils.createRevisionFile).toHaveBeenCalledTimes(1);
    expect(versionUtils.createRevisionFile).toHaveBeenCalledWith(revisionFilename);
  });

  it('should throw an error when trying to execute with the `revision` flag disabled', () => {
    // Given
    const projectConfiguration = {
      version: {
        revision: {
          enabled: false,
        },
      },
    };
    const versionUtils = 'versionUtils';
    let sut = null;
    // When
    sut = new CLIRevisionCommand(projectConfiguration, versionUtils);
    // Then
    expect(() => sut.handle()).toThrow(/The revision feature is disabled/i);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => service } :
            service
        )
      ),
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
    expect(sut.projectConfiguration).toBe('projectConfiguration');
    expect(sut.versionUtils).toBe('versionUtils');
  });
});
