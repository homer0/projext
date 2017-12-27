const path = require('path');
const { provider } = require('jimple');

class BuildNodeRunner {
  constructor(buildNodeRunnerProcess) {
    this.buildNodeRunnerProcess = buildNodeRunnerProcess;
  }

  runTarget(target) {
    if (target.bundle) {
      throw new Error(`${target.name} needs to be bundled in order to run`);
    }

    return target.transpile ?
      this._runWithTranspilation(target) :
      this._run(target);
  }

  _runWithTranspilation(target) {
    const { paths: { source, build } } = target;
    const executable = path.join(build, target.entry.development);
    const watch = [build];
    this.buildNodeRunnerProcess(
      executable,
      watch,
      source,
      build,
      {}
    );
  }

  _run(target) {
    const { paths: { source } } = target;
    const executable = path.join(source, target.entry.development);
    const watch = [source];
    this.buildNodeRunnerProcess(
      executable,
      watch,
      source,
      source,
      {}
    );
  }
}

const buildNodeRunner = provider((app) => {
  app.set('buildNodeRunner', () => new BuildNodeRunner(
    app.get('buildNodeRunnerProcess')
  ));
});

module.exports = {
  BuildNodeRunner,
  buildNodeRunner,
};
