const fs = require('fs-extra');
const shell = require('shelljs');
const { provider } = require('jimple');

class VersionUtils {
  constructor(environmentUtils, appLogger, pathUtils) {
    this.environmentUtils = environmentUtils;
    this.appLogger = appLogger;
    this.pathUtils = pathUtils;

    this.environmentVersionName = 'VERSION';
    this.fallbackVersion = 'development';
    this._loadedVersion = null;
  }

  getEnvironmentVersion(withFallback = true) {
    const fallback = withFallback ? this.fallbackVersion : undefined;
    return this.environmentUtils.get(this.environmentVersionName, fallback).trim();
  }

  getVersionFromFile(filename) {
    let version;
    try {
      const hashLength = 7;
      const filepath = this.pathUtils.join(filename);
      version = fs
      .readFileSync(filepath, 'utf-8')
      .trim()
      .substr(0, hashLength);
    } catch (e) {
      version = '';
    }

    return version;
  }

  getVersion(revisionFilename) {
    if (!this._loadedVersion && this._loadedVersion !== this.fallbackVersion) {
      this._loadedVersion = this.getVersionFromFile(revisionFilename) ||
        this.getEnvironmentVersion();
    }

    return this._loadedVersion;
  }

  createRevisionFile(revisionFilename) {
    let inRepository = true;
    try {
      fs.statSync('./.git');
    } catch (e) {
      inRepository = false;
    }

    let version = '';
    const envVersion = this.getEnvironmentVersion(false);
    if (envVersion) {
      version = envVersion;
    } else if (shell.which('git') && inRepository) {
      const commitHash = shell.exec('git rev-parse HEAD', { silent: true });
      if (commitHash && commitHash.code === 0) {
        version = commitHash.trim();
      }
    }

    let write;
    if (version) {
      const filepath = this.pathUtils.join(revisionFilename);
      write = fs.writeFile(filepath, version)
      .then(() => {
        this.appLogger.success(
          `The revision file was successfully created (${filepath})`
        );
      })
      .catch((error) => {
        this.appLogger.error(
          `There was an error creating the revision file (${filepath})`
        );
        this.appLogger.log(error);
      });
    } else {
      const errorMessage = 'The project is not running on a GIT environment and there\'s no ' +
        `${this.environmentVersionName} variable set, so the revision file couldn't be created.`;
      this.appLogger.error(errorMessage);
    }

    return write;
  }
}

const versionUtils = provider((app) => {
  app.set('versionUtils', () => new VersionUtils(
    app.get('environmentUtils'),
    app.get('appLogger'),
    app.get('pathUtils')
  ));
});

module.exports = {
  VersionUtils,
  versionUtils,
};
