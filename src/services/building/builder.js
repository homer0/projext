const { provider } = require('jimple');

class Builder {
  constructor(buildEngines, targets) {
    this.buildEngines = buildEngines;
    this.targets = targets;
  }

  build(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    const engine = this.buildEngines.getEngine(target.engine);
    return engine.build(target, buildType);
  }

  getBuildCommand(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    const engine = this.buildEngines.getEngine(target.engine);
    return engine.getBuildCommand(target, buildType);
  }
}

const builder = provider((app) => {
  app.set('builder', () => new Builder(
    app.get('buildEngines'),
    app.get('targets')
  ));
});

module.exports = {
  Builder,
  builder,
};
