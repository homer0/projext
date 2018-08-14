const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHNodeRun');

require('jasmine-expect');
const {
  CLISHNodeRunCommand,
  cliSHNodeRunCommand,
} = require('/src/services/cli/cliSHNodeRun');

describe('services/cli:sh-node-run', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const buildNodeRunner = 'buildNodeRunner';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHNodeRunCommand(buildNodeRunner, targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHNodeRunCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.buildNodeRunner).toBe(buildNodeRunner);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.hidden).toBeTrue();
    expect(sut.addOption).toHaveBeenCalledTimes(1);
    expect(sut.addOption).toHaveBeenCalledWith(
      'inspect',
      '-i, --inspect',
      expect.any(String),
      false
    );
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should call the method to run a node target when executed', () => {
    // Given
    const message = 'done';
    const target = 'some-target';
    const buildNodeRunner = {
      runTarget: jest.fn(() => message),
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const options = {
      inspect: false,
    };
    let sut = null;
    let result = null;
    // When
    sut = new CLISHNodeRunCommand(buildNodeRunner, targets);
    result = sut.handle(target, null, options);
    // Then
    expect(result).toBe(message);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(buildNodeRunner.runTarget).toHaveBeenCalledTimes(1);
    expect(buildNodeRunner.runTarget).toHaveBeenCalledWith(target, options.inspect);
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
    cliSHNodeRunCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHNodeRunCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHNodeRunCommand);
    expect(sut.buildNodeRunner).toBe('buildNodeRunner');
    expect(sut.targets).toBe('targets');
  });
});
