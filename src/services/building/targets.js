const path = require('path');
const extend = require('extend');
const { AppConfiguration } = require('wootils/node/appConfiguration');
const { provider } = require('jimple');

class Targets {
  constructor(
    events,
    environmentUtils,
    pathUtils,
    projectConfiguration,
    rootRequire
  ) {
    this.events = events;
    this.environmentUtils = environmentUtils;
    this.pathUtils = pathUtils;
    this.projectConfiguration = projectConfiguration;
    this.rootRequire = rootRequire;
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
        throw new Error(`Target ${name} has an invalid type: ${target.type}`);
      } else {
        const sourceFolderName = target.folder || name;
        const buildFolderName = target.createFolder ? sourceFolderName : '';
        const type = target.type || this.defaultType;
        const isNode = type === 'node';
        const template = targetsTemplates[type];
        const newTarget = extend(true, {}, template, target, {
          name,
          type,
          paths: {
            source: '',
            build: '',
          },
          folders: {
            source: '',
            build: '',
          },
          is: {
            node: isNode,
            browser: !isNode,
          },
        });

        if (!newTarget.transpile && newTarget.flow) {
          newTarget.transpile = true;
        }

        newTarget.folders.source = newTarget.hasFolder ?
          path.join(source, sourceFolderName) :
          source;
        newTarget.paths.source = this.pathUtils.join(newTarget.folders.source);

        newTarget.folders.build = path.join(build, buildFolderName);
        newTarget.paths.build = this.pathUtils.join(newTarget.folders.build);

        this.targets[name] = this.events.reduce('target-load', newTarget);
      }
    });
  }

  getTargets() {
    return this.targets;
  }

  getTarget(name) {
    const target = this.getTargets()[name];
    if (!target) {
      throw new Error(`The required target doesn't exist: ${name}`);
    }

    return target;
  }

  findTargetForFile(file) {
    const targets = this.getTargets();
    const targetName = Object.keys(targets).find((name) => {
      const target = targets[name];
      return file.includes(target.paths.source);
    });

    if (!targetName) {
      throw new Error(`A target for the following file couldn't be found: ${file}`);
    }

    return targets[targetName];
  }

  getBrowserTargetConfiguration(target) {
    if (target.is.node) {
      throw new Error('Only browser targets can generate configuration on the building process');
    }

    const {
      name,
      configuration: {
        enabled,
        default: defaultConfiguration,
        path: configurationsPath,
        hasFolder,
        environmentVariable,
        loadFromEnvironment,
        filenameFormat,
      },
    } = target;
    let result = {};
    if (enabled) {
      let configsPath = configurationsPath;
      if (hasFolder) {
        configsPath += `${name}/`;
      }

      const filenameNewFormat = filenameFormat
      .replace(/\[target-name\]/ig, name)
      .replace(/\[configuration-name\]/ig, '[name]');

      let defaultConfig = {};
      if (defaultConfiguration) {
        defaultConfig = defaultConfiguration;
      } else {
        const defaultConfigPath = `${configsPath}${name}.config.js`;
        defaultConfig = this.rootRequire(defaultConfigPath);
      }

      const appConfiguration = new AppConfiguration(
        this.environmentUtils,
        this.rootRequire,
        name,
        defaultConfig,
        {
          environmentVariable,
          path: configsPath,
          filenameFormat: filenameNewFormat,
        }
      );

      if (loadFromEnvironment) {
        appConfiguration.loadFromEnvironment();
      }

      result = appConfiguration.getConfig();
    }

    return result;
  }
}

const targets = provider((app) => {
  app.set('targets', () => new Targets(
    app.get('events'),
    app.get('environmentUtils'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('rootRequire')
  ));
});

module.exports = {
  Targets,
  targets,
};
