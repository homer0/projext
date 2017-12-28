const fs = require('fs-extra');
const extend = require('extend');

class ConfigurationFile {
  constructor(pathUtils, overwritePath, asFactory = false, parentConfig = null) {
    if (new.target === ConfigurationFile) {
      throw new TypeError(
        'ConfigurationFile is an abstract class, it can\'t be instantiated directly'
      );
    }

    this.pathUtils = pathUtils;
    this.overwritePath = overwritePath;
    this.asFactory = asFactory;
    this.parentConfig = parentConfig;
    this._config = null;
    this._fileConfigLoaded = false;
    this._fileConfig = () => ({});
  }

  createConfig() {
    throw new Error('This method must to be overwritten');
  }

  getConfig(...args) {
    if (!this._config || this.asFactory) {
      this._loadConfig(...args);
    }

    return this._config;
  }

  _loadConfig(...args) {
    if (!this._fileConfigLoaded) {
      this._fileConfigLoaded = true;
      this._loadConfigFromFile();
    }

    let parentConfig = {};
    if (this.parentConfig) {
      parentConfig = this.parentConfig.getConfig(...args);
    }

    this._config = extend(
      true,
      {},
      parentConfig,
      this.createConfig(...args),
      this._fileConfig(...args)
    );
  }

  _loadConfigFromFile() {
    const filepath = this.pathUtils.join('config', this.overwritePath);
    let overwriteContents = null;
    if (fs.pathExistsSync(filepath)) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      overwriteContents = require(filepath);
    }

    if (overwriteContents) {
      const overwriteType = typeof overwriteContents;
      if (overwriteType === 'function') {
        this._fileConfig = overwriteContents;
      } else {
        this._fileConfig = () => overwriteContents;
      }
    }
  }
}

module.exports = ConfigurationFile;
