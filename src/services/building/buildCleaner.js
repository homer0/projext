const fs = require('fs-extra');
const { provider } = require('jimple');

class BuildCleaner {
  constructor(
    appLogger,
    cleaner,
    pathUtils,
    projectConfiguration
  ) {
    this.appLogger = appLogger;
    this.cleaner = cleaner;
    this.pathUtils = pathUtils;
    this.projectConfiguration = projectConfiguration;
  }

  cleanAll() {
    const { paths: { build } } = this.projectConfiguration;
    const dist = this.pathUtils.join(build);
    return this.cleaner(dist, '**')
    .then(() => {
      this.appLogger.success(
        `The distribution directory was successfully removed (${dist})`
      );
    })
    .catch((error) => {
      this.appLogger.error(
        `Error: There was an error while removing the distribution directory (${dist})`
      );
      this.appLogger.log(error);
    });
  }

  cleanTarget(target) {
    const { paths: { build } } = this.projectConfiguration;
    const dist = this.pathUtils.join(build);
    const cleanStep = target.is.node ?
      this.cleanNodeTarget(target) :
      this.cleanBrowserTarget(target);

    return cleanStep
    .then(() => {
      this.appLogger.success(
        `The files for ${target.name} have been was successfully removed from ` +
        `the distribution directory (${dist})`
      );
    })
    .catch((error) => {
      this.appLogger.error(
        `Error: There was an error while removing the files for ${target.name} ` +
        `from the distribution directory (${dist})`
      );
      this.appLogger.log(error);
    });
  }

  cleanNodeTarget(target) {
    const {
      bundle,
      name,
      paths: {
        source,
        build,
      },
    } = target;
    const firstStep = bundle ?
      Promise.resolve(this.getTargetNamesVariation(name)) :
      fs.readdir(source);

    return firstStep
    .then((items) => this.cleaner(build, items));
  }

  cleanBrowserTarget(target) {
    const { paths: { output } } = this.projectConfiguration;
    const {
      name,
      paths: { build },
    } = target;
    const items = [
      ...this.getTargetNamesVariation(name),
      ...Object.keys(output).map((folder) => output[folder]),
    ];

    if (!target.library) {
      items.push(...[
        target.html.filename,
        `${target.html.filename}.gz`,
      ]);
    }

    return this.cleaner(build, items);
  }

  getTargetNamesVariation(name) {
    const names = [
      name,
      `${name}.js`,
      `${name}.js.map`,
      `${name}.*.js`,
      `${name}.*.js.map`,
    ];
    names.push(...names.map((file) => `${file}.gz`));
    return names;
  }
}

const buildCleaner = provider((app) => {
  app.set('buildCleaner', () => new BuildCleaner(
    app.get('appLogger'),
    app.get('cleaner'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig()
  ));
});

module.exports = {
  BuildCleaner,
  buildCleaner,
};
