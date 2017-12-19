const path = require('path');
const babel = require('babel-core');
const fs = require('fs-extra');
const glob = require('glob');
const { provider } = require('jimple');

class NodeTranspiler {
  constructor(
    babelConfiguration,
    appLogger,
    pathUtils,
    projectConfiguration,
    targets
  ) {
    this.babelConfiguration = babelConfiguration;
    this.appLogger = appLogger;
    this.pathUtils = pathUtils;
    this.projectConfiguration = projectConfiguration;
    this.targets = targets;
  }

  transpile(target, type) {
    const { paths } = this.projectConfiguration;
    const targetFile = this.pathUtils.join(
      paths.build,
      target.entry[type]
    );
    const targetPath = path.dirname(targetFile);
    return this.findFiles(targetPath)
    .then((files) => {
      const babelConfig = this.babelConfiguration.getConfigForTarget(target);
      return Promise.all(files.map((file) => this.transpileFile(file, babelConfig)));
    })
    .then((files) => {
      this.appLogger.success('The following files have been successfully transpiled:');
      // Remove the absolute path and the first `/`
      const prefix = this.pathUtils.path.length + 1;
      files.forEach((file) => {
        const filepath = file.substr(prefix);
        this.appLogger.info(`${filepath}`);
      });
    })
    .catch((error) => {
      this.appLogger.error(
        `There was an error while transpiling the ${this.nodeName} code`
      );
      this.appLogger.log(error);
    });
  }

  transpileFile(filepath, options = null, writeFile = true) {
    let from = '';
    let to = '';
    if (typeof filepath === 'string') {
      from = filepath;
      to = filepath;
    } else {
      from = filepath.source;
      to = filepath.output;
    }

    const babelOptions = options || this.getTargetConfigurationForFile(from);
    const firstStep = new Promise((resolve, reject) => {
      babel.transformFile(from, babelOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.code);
        }
      });
    });

    let result;
    if (writeFile) {
      result = firstStep
      .then((code) => fs.writeFile(to, code))
      .then(() => to);
    } else {
      result = firstStep
      .then((code) => ({ filepath: to, code }));
    }

    return result;
  }

  transpileFileSync(filepath, options = null, writeFile = true) {
    let from = '';
    let to = '';
    if (typeof filepath === 'string') {
      from = filepath;
      to = filepath;
    } else {
      from = filepath.source;
      to = filepath.output;
    }

    const babelOptions = options || this.getTargetConfigurationForFile(from);
    const { code } = babel.transformFileSync(from, babelOptions);
    let result;
    if (writeFile) {
      fs.writeFileSync(to, code);
      result = to;
    } else {
      result = { filepath: to, code };
    }

    return result;
  }

  findFiles(directory, pattern = '**/*.{js,jsx}') {
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: directory }, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files.map((file) => path.join(directory, file)));
        }
      });
    });
  }

  getTargetConfigurationForFile(file) {
    const target = this.targets.findTargetForFile(file);
    if (!target) {
      throw new Error(`A target couldn't be find for the following file: ${file}`);
    }

    return this.babelConfiguration.getConfigForTarget(target);
  }
}

const nodeTranspiler = provider((app) => {
  app.set('nodeTranspiler', () => new NodeTranspiler(
    app.get('babelConfiguration'),
    app.get('appLogger'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig(),
    app.get('targets')
  ));
});

module.exports = {
  NodeTranspiler,
  nodeTranspiler,
};
