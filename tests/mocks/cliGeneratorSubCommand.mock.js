const mocks = {
  constructor: jest.fn(),
  addOption: jest.fn(),
};

class CLIGeneratorSubCommandMock {
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
  }
}

module.exports = CLIGeneratorSubCommandMock;
