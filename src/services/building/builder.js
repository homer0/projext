const { provider } = require('jimple');

class Builder {
  constructor(buildEngines, targets) {
    this.buildEngines = buildEngines;
    this.targets = targets;
  }

  getBuildCommand(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    const engine = this.buildEngines.getEngine(target.engine);
    return engine.getCommand(target, buildType);
  }

  getBuildConfiguration(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    const engine = this.buildEngines.getEngine(target.engine);
    return engine.getConfiguration(target, buildType);
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
