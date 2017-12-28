const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/app/index');

require('jasmine-expect');

const { Woopack } = require('/src/app');
const packageInfo = require('../../package.json');

describe('app:Woopack', () => {
  beforeEach(() => {
    JimpleMock.reset();
  });

  it('should load the plugins and add the error handler when instantiated', () => {
    // Given
    let sut = null;
    const loadPlugins = jest.fn();
    const listenErrors = jest.fn();
    const get = jest.fn(() => ({
      load: loadPlugins,
      listen: listenErrors,
    }));
    JimpleMock.mock('get', get);
    // When
    sut = new Woopack();
    // Then
    expect(sut).toBeInstanceOf(Woopack);
    expect(loadPlugins).toHaveBeenCalledTimes(1);
    expect(listenErrors).toHaveBeenCalledTimes(1);
  });

  it('should register the package.json as \'info\' when instantiated', () => {
    // Given
    let sut = null;
    let infoServiceName = null;
    let infoServiceFn = null;
    const loadPlugins = jest.fn();
    const listenErrors = jest.fn();
    const get = jest.fn(() => ({
      load: loadPlugins,
      listen: listenErrors,
    }));
    JimpleMock.mock('get', get);
    const set = jest.fn();
    JimpleMock.mock('set', set);
    // When
    sut = new Woopack();
    [[infoServiceName, infoServiceFn]] = set.mock.calls;
    // Then
    expect(sut).toBeInstanceOf(Woopack);
    expect(loadPlugins).toHaveBeenCalledTimes(1);
    expect(listenErrors).toHaveBeenCalledTimes(1);
    expect(infoServiceName).toBe('info');
    expect(infoServiceFn()).toEqual(packageInfo);
  });

  it('should start the CLI the interface', () => {
    // Given
    let sut = null;
    const loadPlugins = jest.fn();
    const listenErrors = jest.fn();
    const startCLI = jest.fn();
    const get = jest.fn(() => ({
      load: loadPlugins,
      listen: listenErrors,
      start: startCLI,
    }));
    JimpleMock.mock('get', get);
    // When
    sut = new Woopack();
    sut.cli();
    // Then
    expect(sut).toBeInstanceOf(Woopack);
    expect(loadPlugins).toHaveBeenCalledTimes(1);
    expect(listenErrors).toHaveBeenCalledTimes(1);
    expect(startCLI).toHaveBeenCalledTimes(1);
    expect(startCLI).toHaveBeenCalledWith(expect.any(Array));
  });
});
