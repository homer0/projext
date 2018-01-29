const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHValidateRun');

require('jasmine-expect');
const {
  CLISHValidateRunCommand,
  cliSHValidateRunCommand,
} = require('/src/services/cli/cliSHValidateRun');

describe('services/cli:validate-run', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHValidateRunCommand(targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateRunCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.targets).toBe(targets);
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
    expect(sut.hidden).toBeTrue();
  });

  it('should validate the exist when executed', () => {
    // Given
    const message = 'done';
    const target = 'some-target';
    const targets = {
      getTarget: jest.fn(() => message),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHValidateRunCommand(targets);
    result = sut.handle(target);
    // Then
    expect(result).toBe(message);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
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
    cliSHValidateRunCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHValidateRunCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHValidateRunCommand);
    expect(sut.targets).toBe('targets');
  });
});
