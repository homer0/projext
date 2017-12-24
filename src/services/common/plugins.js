const { provider } = require('jimple');

class Plugins {
  constructor(prefix, app, appLogger, packageInfo, pathUtils) {
    this.prefix = prefix;
    this.app = app;
    this.appLogger = appLogger;
    this.packageInfo = packageInfo;
    this.pathUtils = pathUtils;
  }

  load(dependencies = true, devDependencies = true) {
    const packages = [];
    if (dependencies && this.packageInfo.dependencies) {
      packages.push(...Object.keys(this.packageInfo.dependencies));
    }

    if (devDependencies && this.packageInfo.devDependencies) {
      packages.push(...Object.keys(this.packageInfo.devDependencies));
    }

    packages
    .filter((name) => name.startsWith(this.prefix))
    .forEach((name) => this._loadPlugin(name));
  }

  _loadPlugin(packageName) {
    try {
      const packagePath = this.pathUtils.join('node_modules', packageName);
      // eslint-disable-next-line global-require,import/no-dynamic-require
      const plugin = require(packagePath);
      plugin(this.app);
    } catch (error) {
      this.appLogger.error(`The plugin ${packageName} couldn't be loaded`);
      this.appLogger.log(error);
    }
  }
}

const plugins = (prefix) => provider((app) => {
  app.set('plugins', () => new Plugins(
    prefix,
    app,
    app.get('appLogger'),
    app.get('packageInfo'),
    app.get('pathUtils')
  ));
});

module.exports = {
  Plugins,
  plugins,
};
