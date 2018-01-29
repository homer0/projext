const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliCopyProjectFiles');

require('jasmine-expect');
const {
  CLICopyProjectFilesCommand,
  cliCopyProjectFilesCommand,
} = require('/src/services/cli/cliCopyProjectFiles');

describe('services/cli:copyProjectFiles', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildCopier = 'buildCopier';
    let sut = null;
    // When
    sut = new CLICopyProjectFilesCommand(buildCopier);
    // Then
    expect(sut).toBeInstanceOf(CLICopyProjectFilesCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.buildCopier).toBe(buildCopier);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
  });

  it('should call the method to copy the project files when executed', () => {
    // Given
    const message = 'done';
    const buildCopier = {
      copyFiles: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLICopyProjectFilesCommand(buildCopier);
    result = sut.handle();
    // Then
    expect(result).toBe(message);
    expect(buildCopier.copyFiles).toHaveBeenCalledTimes(1);
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
    cliCopyProjectFilesCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliCopyProjectFilesCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLICopyProjectFilesCommand);
    expect(sut.buildCopier).toBe('buildCopier');
  });
});
