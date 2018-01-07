const fs = require('fs-extra');
const path = require('path');
const { provider } = require('jimple');

class BuildCopier {
  constructor(copier, appLogger, pathUtils, projectConfiguration) {
    this.copier = copier;
    this.appLogger = appLogger;
    this.pathUtils = pathUtils;
    this.projectConfiguration = projectConfiguration;
  }

  copyFiles() {
    let result;
    const {
      copy,
      version: {
        revision,
      },
      paths: {
        build,
        privateModules,
      },
    } = this.projectConfiguration;

    if (copy.enabled) {
      const items = [];
      const copiedModules = {};
      if (Array.isArray(copy.items)) {
        copy.items.forEach((item) => {
          if (typeof item === 'string' && item.startsWith('node_modules')) {
            const newModulePath = item.replace(/^(node_modules\/)/, `${privateModules}/`);
            copiedModules[item.split('/').pop()] = newModulePath;
            items.push({
              [item]: newModulePath,
            });
          } else {
            items.push(item);
          }
        });

        if (
          revision.enabled &&
          revision.copy &&
          fs.pathExistsSync(this.pathUtils.join(revision.filename))
        ) {
          items.push(revision.filename);
        }

        if (items.length) {
          const thispath = this.pathUtils.path;
          result = this.copier(
            thispath,
            this.pathUtils.join(build),
            items
          )
          .then((results) => {
            this.appLogger.success('The following items have been successfully copied:');
            // Remove the absolute path and the first `/`
            const prefix = thispath.length + 1;
            results.forEach((item) => {
              const from = item.from.substr(prefix);
              const to = item.to.substr(prefix);
              this.appLogger.info(`${from} -> ${to}`);
            });

            return Object.keys(copiedModules).length ?
              this.addPrivateModules(this.pathUtils.join(build, 'package.json'), copiedModules) :
              {};
          })
          .catch((error) => {
            this.appLogger.error('There was an error copying the files');
            return Promise.reject(error);
          });
        } else {
          result = Promise.resolve();
        }
      } else {
        result = Promise.reject(new Error('The \'copy.items\' setting is not an array'));
      }
    } else {
      result = Promise.resolve();
    }

    return result;
  }

  addPrivateModules(packagePath, modules, updateModulesToo = true) {
    return fs.readJson(packagePath)
    .then((packageContents) => {
      const newPackage = Object.assign({}, packageContents);

      ['dependencies', 'devDependencies']
      .forEach((type) => {
        Object.keys(modules).forEach((dependencyName) => {
          if (newPackage[type] && newPackage[type][dependencyName]) {
            const privatePath = modules[dependencyName];
            newPackage[type][dependencyName] = `./${privatePath}`;
          }
        });
      });

      Object.keys(newPackage).forEach((property) => {
        if (property.startsWith('_')) {
          delete newPackage[property];
        }
      });

      return fs.writeJson(packagePath, newPackage);
    })
    .then(() => {
      let result = {};
      if (updateModulesToo) {
        const { paths: { privateModules } } = this.projectConfiguration;
        const directory = path.join(path.dirname(packagePath), privateModules);
        const packages = [];
        const modulesWithPathToRoot = {};
        Object.keys(modules).forEach((dependencyName) => {
          const privatePath = modules[dependencyName];
          // 2 levels = one to `node_modules` and one more to where the package.json is
          modulesWithPathToRoot[dependencyName] = `../../${privatePath}`;
          packages.push(path.join(directory, dependencyName, 'package.json'));
        });

        result = Promise.all(packages.map((modulePackage) => this.addPrivateModules(
          modulePackage,
          modulesWithPathToRoot,
          false
        )));
      }

      return result;
    });
  }

  copyTargetFiles(target) {
    return fs.ensureDir(target.paths.build)
    .then(() => fs.readdir(target.paths.source))
    .then((items) => this.copier(
      target.paths.source,
      target.paths.build,
      items
    ))
    .then(() => {
      this.appLogger.success(
        `The files for ${target.name} have been successfully copied (${target.paths.build})`
      );
    })
    .catch((error) => {
      this.appLogger.error(`The files for ${target.name} couldn't be copied`);
      return Promise.reject(error);
    });
  }
}

const buildCopier = provider((app) => {
  app.set('buildCopier', () => new BuildCopier(
    app.get('copier'),
    app.get('appLogger'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig()
  ));
});

module.exports = {
  BuildCopier,
  buildCopier,
};
