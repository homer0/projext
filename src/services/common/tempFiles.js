const path = require('path');
const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * A utility service to read, write and delete temporary files.
 */
class TempFiles {
  /**
   * Class constructor.
   * @param {Object}    info                  The application `package.json`, necessary to get the
   *                                          module name and build the path of the temp directory.
   * @param {PathUtils} pathUtils             To Register the temp directory location and build the
   *                                          paths to the files.
   * @param {string}    [directory='.tmp']    The name of the temp directory.
   * @param {string}    [locationName='temp'] The name that will be used to register the temp
   *                                          directory path as a location on the `pathUtils`
   *                                          service.
   */
  constructor(info, pathUtils, directory = '.tmp', locationName = 'temp') {
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * The location name for the temp directory path on the `pathUtils` service.
     * @type {string}
     */
    this.locationName = locationName;

    this.pathUtils.addLocation(locationName, path.join(
      'node_modules',
      info.name,
      directory
    ));
  }
  /**
   * Generate a path for the temp directory.
   * @param {Array} rest The rest of the components that will be added to the path after the one
   *                     for the temp directory.
   * @return {string}
   */
  path(...rest) {
    return this.pathUtils.joinFrom(this.locationName, ...rest);
  }
  /**
   * Read a file from the temp directory.
   * @param {string} filepath           The path to the file.
   * @param {string} [encoding='utf-8'] The text encoding in which the file should be read.
   * @return {Promise<string,Error>}
   */
  read(filepath, encoding = 'utf-8') {
    return this.ensureDirectory()
    .then(() => fs.readFile(this.path(filepath), encoding));
  }
  /**
   * Read a file from the temp directory, sync version.
   * @param {string} filepath           The path to the file.
   * @param {string} [encoding='utf-8'] The text encoding in which the file should be read.
   * @return {string}
   * @throws {Error} If the file can't be read.
   */
  readSync(filepath, encoding = 'utf-8') {
    this.ensureDirectorySync();
    return fs.readFileSync(this.path(filepath), encoding);
  }
  /**
   * Write a file on the temp directory.
   * @param {string} filepath The path to the file.
   * @param {string} data     The contents of the file.
   * @return {Promise<string,Error>} On success, the promise resolves with the absolute path to
   *                                 the file.
   */
  write(filepath, data) {
    const tempFilepath = this.path(filepath);
    return this.ensureDirectory()
    .then(() => fs.writeFile(tempFilepath, data))
    .then(() => tempFilepath);
  }
  /**
   * Write a file on the temp directory, sync version.
   * @param {string} filepath The path to the file.
   * @param {string} data     The contents of the file.
   * @return {string} The absolute path to the file.
   * @throws {Error} If the method couldn't write on the file.
   */
  writeSync(filepath, data) {
    this.ensureDirectorySync();
    const tempFilepath = this.path(filepath);
    fs.writeFileSync(tempFilepath, data);
    return tempFilepath;
  }
  /**
   * Delete a file from the temp directory.
   * @param {string} filepath The path to the file.
   * @return {Promise<string,Error>} On success, the promise resolves with the absolute path to
   *                                 the file.
   */
  delete(filepath) {
    const tempFilepath = this.path(filepath);
    return this.ensureDirectory()
    .then(() => fs.unlink(tempFilepath))
    .then(() => tempFilepath);
  }
  /**
   * Delete a file from the temp directory, sync version.
   * @param {string} filepath The path to the file.
   * @return {string} The absolute path to the file.
   * @throws {Error} If the method couldn't delete the file.
   */
  deleteSync(filepath) {
    this.ensureDirectorySync();
    const tempFilepath = this.path(filepath);
    fs.unlinkSync(tempFilepath);
    return tempFilepath;
  }
  /**
   * Ensure that the temp directory exists
   * @return {Promise<undefined,Error>}
   */
  ensureDirectory() {
    return fs.ensureDir(this.pathUtils.getLocation(this.locationName));
  }
  /**
   * Ensure that the temp directory exists, sync version.
   * @throws {Error} If the directory can't be created.
   */
  ensureDirectorySync() {
    return fs.ensureDirSync(this.pathUtils.getLocation(this.locationName));
  }
}
/**
 * Generates a {@link Provider} with a custom directory and/or location name for the temp directory.
 * You can also specify a custom service name, which can be helpfull if you want to create multiple
 * services for temp files.
 * @example
 * // Generate the provider
 * const provider = tempFilesCustom('.my-files', 'myTempFiles', 'myTempFiles');
 * // Register it on the container
 * container.register(provider);
 * // Get access to the service instance
 * const myTempFiles = container.get('myTempFiles');
 * @param {string} [directory]               The name of the temp directory.
 * @param {string} [locationName]            The name that will be used to register the temp
 *                                           directory path as a location on the `pathUtils`
 *                                           service.
 * @param {string} [serviceName='tempFiles'] The name that will be used to register the
 *                                           {@link TempFiles} instance as a service.
 * @return {Provider}
 */
const tempFilesCustom = (directory, locationName, serviceName = 'tempFiles') => provider((app) => {
  app.set(serviceName, () => new TempFiles(
    app.get('info'),
    app.get('pathUtils'),
    directory,
    locationName
  ));
});
/**
 * The service provider that once registered on the app container will set an instance of
 * {@link TempFiles} as the `tempFiles` service.
 * @example
 * // Register it on the container
 * container.register(tempFiles);
 * // Getting access to the service instance
 * const tempFiles = container.get('tempFiles');
 * @type {Provider}
 */
const tempFiles = tempFilesCustom();

module.exports = {
  TempFiles,
  tempFilesCustom,
  tempFiles,
};
