const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('commander');
jest.unmock('/src/services/cli/cli');

require('jasmine-expect');
const commander = require('commander');
const { CLI, cli } = require('/src/services/cli/cli');

const originalArgv = process.argv;

describe('services/cli:program', () => {
  beforeEach(() => {
    commander.version.mockReset();
    commander.description.mockReset();
    commander.parse.mockReset();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should be instantiated', () => {
    // Given
    const info = {
      name: 'cli',
    };
    let sut = null;
    // When
    sut = new CLI(info);
    // Then
    expect(sut).toBeInstanceOf(CLI);
    expect(sut.name).toBe(info.name);
    expect(sut.info).toEqual(info);
  });

  it('should be instantiated with a custom name', () => {
    // Given
    const name = 'program';
    const info = {
      name: 'cli',
    };
    let sut = null;
    // When
    sut = new CLI(info, name);
    // Then
    expect(sut).toBeInstanceOf(CLI);
    expect(sut.name).toBe(name);
    expect(sut.info).toEqual(info);
  });

  it('should start the program with a list of commands', () => {
    // Given
    const info = {
      name: 'cli',
      description: 'CLI Description',
      version: 'alpha.0-5',
    };
    const command = {
      register: jest.fn(),
    };
    const commands = [command];
    let sut = null;
    // When
    sut = new CLI(info);
    sut.start(commands);
    // Then
    expect(commander.version).toHaveBeenCalledTimes(1);
    expect(commander.version).toHaveBeenCalledWith(
      info.version,
      '-v, --version'
    );
    expect(commander.description).toHaveBeenCalledTimes(1);
    expect(commander.description).toHaveBeenCalledWith(info.description);
    expect(command.register).toHaveBeenCalledTimes(1);
    expect(command.register).toHaveBeenCalledWith(commander, sut);
    expect(commander.parse).toHaveBeenCalledTimes(1);
    expect(commander.parse).toHaveBeenCalledWith(process.argv);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const info = {
      name: 'cli',
    };
    const container = {
      set: jest.fn(),
      get: jest.fn(() => info),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cli(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cli');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLI);
    expect(sut.name).toBe(info.name);
    expect(sut.info).toEqual(info);
  });
});
