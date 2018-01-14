const mocks = {
  constructor: jest.fn(),
  loadFromEnvironment: jest.fn(),
  getConfig: jest.fn(),
};

class WootilsAppConfigurationMock {
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

    this.loadFromEnvironment = mocks.loadFromEnvironment;
    this.getConfig = mocks.getConfig;
  }
}

module.exports = WootilsAppConfigurationMock;
module.exports.mocks = mocks;
