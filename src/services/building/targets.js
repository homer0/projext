const path = require('path');
const extend = require('extend');
const { provider } = require('jimple');

class Targets {
  constructor(appLogger, pathUtils, projectConfiguration) {
    this.appLogger = appLogger;
    this.pathUtils = pathUtils;
    this.projectConfiguration = projectConfiguration;
    this.targets = {};
    this.typesValidationRegex = /^(?:node|browser)$/i;
    this.defaultType = 'node';
    this.loadTargets();
  }

  loadTargets() {
    const {
      targets,
      targetsTemplates,
      paths: { source, build },
    } = this.projectConfiguration;
    Object.keys(targets).forEach((name) => {
      const target = targets[name];
      if (target.type && !this.typesValidationRegex.test(target.type)) {
        this.appLogger.error(`Target ${name} has an invalid type: ${target.type}`);
      } else {
        const paths = {
          source: '',
          build: '',
        };

        const folders = {
          source: '',
          build: '',
        };

        const sourceFolderName = target.folder || name;
        const buildFolderName = target.createFolder ? sourceFolderName : '';
        const type = target.type || this.defaultType;
        const isNode = type === 'node';
        const template = targetsTemplates[type];
        const newTarget = extend(true, template, target, {
          name,
          type,
          paths,
          folders,
          is: {
            node: isNode,
            browser: !isNode,
          },
        });

        newTarget.folders.source = newTarget.hasFolder ?
          path.join(source, sourceFolderName) :
          source;
        newTarget.paths.source = this.pathUtils.join(newTarget.fodlers.source);

        newTarget.folders.build = path.join(build, buildFolderName);
        newTarget.paths.build = this.pathUtils.join(newTarget.folders.build);

        this.targets[name] = newTarget;
      }
    });
  }

  getTargets() {
    return this.targets;
  }

  getTarget(name) {
    const target = this.getTarget()[name];
    if (!target) {
      throw new Error(`The required target doesn't exist: ${name}`);
    }

    return target;
  }

  findTargetForFile(file) {
    const targets = this.getTargets();
    const targetName = Object.keys(targets).find((name) => {
      const target = targets[name];
      return file.includes(target.path.source);
    });

    if (!targetName) {
      throw new Error(`A target for the following file couldn't be found: ${file}`);
    }

    return targets[targetName];
  }
}

const targets = provider((app) => {
  app.set('targets', () => new Targets(
    app.get('appLogger'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig()
  ));
});

module.exports = {
  Targets,
  targets,
};
