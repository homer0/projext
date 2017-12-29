const mocks = {
  constructor: jest.fn(),
  watch: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
};

class WatchpackMock {
  static mock(name, mock) {
    mocks[name] = mock;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });
  }

  constructor(...args) {
    this.constructorMock = mocks.constructor;
    this.constructorMock(...args);

    this.watch = mocks.watch;
    this.on = mocks.on;
    this.close = mocks.close;
  }
}

module.exports = WatchpackMock;
