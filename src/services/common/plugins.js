const { provider } = require('jimple');

class Plugins {
  constructor(prefix, app, appLogger, packageInfo) {
    this.prefix = prefix;
    this.app = app;
    this.packageInfo = packageInfo;
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
      // eslint-disable-next-line global-require,import/no-dynamic-require
      const plugin = require(packageName);
      plugin(this.app);
      this.appLogger.success(`The plugin ${packageName} has been successfully loaded`);
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
    app.get('packageInfo')
  ));
});

module.exports = {
  Plugins,
  plugins,
};
