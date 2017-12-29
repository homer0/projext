const mocks = {
  constructor: jest.fn(),
};

class ConfigurationFileMock {
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
  }

  getConfig(...args) {
    return this.createConfig(...args);
  }
}

module.exports = ConfigurationFileMock;
