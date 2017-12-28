const mocks = {
  set: jest.fn(),
  get: jest.fn(),
  register: jest.fn(),
};

class JimpleMock {
  static mock(name, mock) {
    mocks[name] = mock;
  }

  static reset() {
    Object.keys(mocks).forEach((name) => {
      mocks[name].mockReset();
    });
  }

  static provider(register) {
    return register;
  }

  constructor() {
    this.set = mocks.set;
    this.get = mocks.get;
    this.register = mocks.register;
  }
}

module.exports = JimpleMock;
