const { provider } = require('jimple');

class Builder {
  constructor(
    buildCleaner,
    buildCopier,
    buildEngines,
    buildTranspiler,
    targets
  ) {
    this.buildCleaner = buildCleaner;
    this.buildCopier = buildCopier;
    this.buildEngines = buildEngines;
    this.buildTranspiler = buildTranspiler;
    this.targets = targets;
  }

  getTargetBuildCommand(target, buildType, forceRun = false) {
    let command = '';
    if (target.bundle !== false) {
      const engine = this.buildEngines.getEngine(target.engine);
      command = engine.getBuildCommand(target, buildType, forceRun);
    }

    return command;
  }

  copyTarget(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    let result;
    if (
      target.is.node &&
      target.bundle === false &&
      (buildType === 'production' || target.transpile)
    ) {
      result = this.buildCopier.copyTargetFiles(target);
    } else {
      result = Promise.resolve();
    }

    return result;
  }

  transpileTarget(targetName, buildType) {
    const target = this.targets.getTarget(targetName);
    let result;
    if (
      target.is.node &&
      target.bundle === false &&
      target.transpile
    ) {
      result = this.buildTranspiler.transpileTargetFiles(target, buildType);
    } else {
      result = Promise.resolve();
    }

    return result;
  }

  cleanTarget(targetName) {
    const target = this.targets.getTarget(targetName);
    return this.buildCleaner.cleanTarget(target);
  }
}

const builder = provider((app) => {
  app.set('builder', () => new Builder(
    app.get('buildCleaner'),
    app.get('buildCopier'),
    app.get('buildEngines'),
    app.get('buildTranspiler'),
    app.get('targets')
  ));
});

module.exports = {
  Builder,
  builder,
};
