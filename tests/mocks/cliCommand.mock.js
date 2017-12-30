const mocks = {
  constructor: jest.fn(),
  addOption: jest.fn(),
  output: jest.fn(),
};

class CLICommandMock {
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
    this.addOption = mocks.addOption;
    this.output = mocks.output;
  }

  getConfig(...args) {
    return this.createConfig(...args);
  }
}

module.exports = CLICommandMock;
