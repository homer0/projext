const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHCopy');

require('jasmine-expect');
const {
  CLISHCopyCommand,
  cliSHCopyCommand,
} = require('/src/services/cli/cliSHCopy');

describe('services/cli:sh-copy', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const builder = 'builder';
    let sut = null;
    // When
    sut = new CLISHCopyCommand(builder);
    // Then
    expect(sut).toBeInstanceOf(CLISHCopyCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.builder).toBe(builder);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(1);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
    expect(sut.hidden).toBeTrue();
  });

  it('should call the method to copy the target files when executed', () => {
    // Given
    const message = 'done';
    const target = 'some-target';
    const type = 'development';
    const builder = {
      copyTarget: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHCopyCommand(builder);
    result = sut.handle(target, null, { type });
    // Then
    expect(result).toBe(message);
    expect(builder.copyTarget).toHaveBeenCalledTimes(1);
    expect(builder.copyTarget).toHaveBeenCalledWith(target, type);
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
    cliSHCopyCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHCopyCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHCopyCommand);
    expect(sut.builder).toBe('builder');
  });
});
