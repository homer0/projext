const extend = require('extend');

const mocks = {
  constructor: jest.fn(),
};

let overwrites = {};

class ConfigurationFileMock {
  static mock(name, mock) {
    mocks[name] = mock;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });

    overwrites = {};
  }

  static overwrite(changes) {
    overwrites = changes;
  }

  constructor(...args) {
    this.constructorMock = mocks.constructor;
    this.constructorMock(...args);
    this._config = {};
  }

  getConfig(...args) {
    this._loadConfig(...args);
    return this._config;
  }

  _loadConfig(...args) {
    this._config = extend(true, {}, this.createConfig(...args), overwrites);
  }
}

module.exports = ConfigurationFileMock;
