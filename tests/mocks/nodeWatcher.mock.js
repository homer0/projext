const mocks = {
  constructor: jest.fn(),
  watch: jest.fn(),
  onChange: jest.fn(),
  getPaths: jest.fn(),
  stop: jest.fn(),
};

class NodeWatcherMock {
  static get mocks() {
    return mocks;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });
  }

  constructor(...args) {
    mocks.constructor(...args);
    this._paths = [];
    this.watching = false;
  }

  setPaths(paths) {
    this._paths = paths;
  }

  getPaths() {
    mocks.getPaths();
    return this._paths;
  }

  watch(...args) {
    this.watching = true;
    mocks.watch(...args);
  }

  stop(...args) {
    mocks.stop(...args);
  }

  callOnStart(...args) {
    return this._onStart(...args);
  }

  callOnChange(...args) {
    return this._onChange(...args);
  }

  callOnInvalidPathForChange(...args) {
    return this._onInvalidPathForChange(...args);
  }

  callTranspileFile(...args) {
    return this._transpileFile(...args);
  }

  callCopyFile(...args) {
    return this._copyFile(...args);
  }

  _onChange(...args) {
    return mocks.onChange(...args);
  }
}

module.exports = NodeWatcherMock;
