const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHNodeWatch');

require('jasmine-expect');
const {
  CLISHNodeWatchCommand,
  cliSHNodeWatchCommand,
} = require('/src/services/cli/cliSHNodeWatch');

describe('services/cli:sh-node-watch', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildNodeWatcher = 'buildNodeWatcher';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHNodeWatchCommand(buildNodeWatcher, targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHNodeWatchCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.buildNodeWatcher).toBe(buildNodeWatcher);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.hidden).toBeTrue();
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should call the method to watch a node target when executed', () => {
    // Given
    const message = 'done';
    const target = 'some-target';
    const buildNodeWatcher = {
      watchTarget: jest.fn(() => message),
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHNodeWatchCommand(buildNodeWatcher, targets);
    result = sut.handle(target);
    // Then
    expect(result).toBe(message);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(buildNodeWatcher.watchTarget).toHaveBeenCalledTimes(1);
    expect(buildNodeWatcher.watchTarget).toHaveBeenCalledWith(target);
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
    cliSHNodeWatchCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHNodeWatchCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHNodeWatchCommand);
    expect(sut.buildNodeWatcher).toBe('buildNodeWatcher');
    expect(sut.targets).toBe('targets');
  });
});
