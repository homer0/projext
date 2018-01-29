const fs = require('fs-extra');
const shell = require('shelljs');
const { provider } = require('jimple');
/**
 * A set of utilities to work with the version of the project.
 */
class VersionUtils {
  /**
   * Class constructor.
   * @param {EnvironmentUtils} environmentUtils To read the environment variables.
   * @param {Logger}           appLogger        To inform the user if something goes wrong.
   * @param {PathUtils}        pathUtils        To build paths for the revision file.
   */
  constructor(environmentUtils, appLogger, pathUtils) {
    /**
     * A local reference for the `environmentUtils` service.
     * @type {EnvironmentUtils}
     */
    this.environmentUtils = environmentUtils;
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * The default fallback version in case none can be retrieved.
     * @type {string}
     */
    this.fallbackVersion = 'development';
    /**
     * This will be filled with the version on the revision file, if it exists.
     * @type {null|string}
     * @ignore
     * @access protected
     */
    this._loadedVersion = null;
  }
  /**
   * Get the version from an environment variable.
   * @param {string}  environmentVariable The name of the environment variable.
   * @param {boolean} [withFallback=true] If `true` and there's no version on the variable, it will
   *                                       return the fallback version.
   * @return {string}
   */
  getEnvironmentVersion(environmentVariable, withFallback = true) {
    const fallback = withFallback ? this.fallbackVersion : undefined;
    return this.environmentUtils.get(environmentVariable, fallback).trim();
  }
  /**
   * Get the version from the revision file. If the revision file doesn't exist or can't be loaded,
   * it will return an empty string.
   * @param  {string} filename The path to the revision file.
   * @return {string}
   */
  getVersionFromFile(filename) {
    let version;
    try {
      const filepath = this.pathUtils.join(filename);
      version = fs
      .readFileSync(filepath, 'utf-8')
      .trim();
    } catch (e) {
      version = '';
    }

    return version;
  }
  /**
   * Look for a version on both the revision file and the environment variable.
   * @param {string} revisionFilename    The path to the revision file.
   * @param {string} environmentVariable The name of the environment variable.
   * @return {string}
   */
  getVersion(revisionFilename, environmentVariable) {
    if (!this._loadedVersion || this._loadedVersion === this.fallbackVersion) {
      this._loadedVersion = this.getVersionFromFile(revisionFilename) ||
        this.getEnvironmentVersion(environmentVariable);
    }

    return this._loadedVersion;
  }
  /**
   * Create the revision file with either the version from the environment or, if the project is
   * on a GIT repository, with the first `7` letters of the last commit hash.
   * @param {string} revisionFilename    The path to where the revision file will be created.
   * @param {string} environmentVariable The name of the environment variable.
   * @return {Promise<string,Error>} If everything goes well, the promise will resolve with the
   *                                 version the method wrote on the file.
   */
  createRevisionFile(revisionFilename, environmentVariable) {
    let inRepository = true;
    try {
      fs.statSync('./.git');
    } catch (e) {
      inRepository = false;
    }

    let version = '';
    const envVersion = this.getEnvironmentVersion(environmentVariable, false);
    if (envVersion) {
      version = envVersion;
    } else if (shell.which('git') && inRepository) {
      const commitHash = shell.exec('git rev-parse HEAD', { silent: true });
      if (commitHash && commitHash.code === 0) {
        const hashLength = 7;
        version = commitHash.trim().substr(0, hashLength);
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

        return version;
      })
      .catch((error) => {
        this.appLogger.error(
          `There was an error creating the revision file (${filepath})`
        );
        return Promise.reject(error);
      });
    } else {
      this.appLogger.error('The revision file couldn\'t be created');
      const errorMessage = 'The project is not running on a GIT environment and there\'s no ' +
        `${environmentVariable} variable set`;
      write = Promise.reject(new Error(errorMessage));
    }

    return write;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `VersionUtils` as the `versionUtils` service.
 * @example
 * // Register it on the container
 * container.register(versionUtils);
 * // Getting access to the service instance
 * const versionUtils = container.get('versionUtils');
 * @type {Provider}
 */
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
