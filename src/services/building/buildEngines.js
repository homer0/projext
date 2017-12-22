const { provider } = require('jimple');

class BuildEngines {
  constructor(app) {
    this.app = app;
  }

  getEngine(name) {
    return this.app.get(`${name}BuildEngine`);
  }
}

const buildEngines = provider((app) => {
  app.set('buildEngines', () => new BuildEngines(app));
});

module.exports = {
  BuildEngines,
  buildEngines,
};
