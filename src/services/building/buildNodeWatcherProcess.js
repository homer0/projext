const path = require('path');
const fs = require('fs-extra');
const { provider } = require('jimple');
const NodeWatcher = require('../../abstracts/nodeWatcher');
/**
 * This service watches directories in order to copy and/or transpile files into their
 * build/distribution directories when they change.
 * @extends {NodeWatcher}
 */
class BuildNodeWatcherProcess extends NodeWatcher {
  /**
   * @param {Logger}                       appLogger            The inform on the CLI of the events
   *                                                            of the watcher.
   * @param {BuildTranspiler}              buildTranspiler      To transpile files if needed.
   * @param {ProjectConfigurationSettings} projectConfiguration To read the watch settings.
   */
  constructor(appLogger, buildTranspiler, projectConfiguration) {
    super({
      poll: projectConfiguration.others.watch.poll,
    });
    /**
     * A local reference for the `appLogger` service.
     * @type {Logger}
     */
    this.appLogger = appLogger;
    /**
     * A local reference for the `buildTranspiler` service.
     * @type {BuildTranspiler}
     */
    this.buildTranspiler = buildTranspiler;
  }
  /**
   * This is called when the service is about to start watching the directories.
   * The overwrite is just for logging some information messages.
   * @access protected
   * @ignore
   */
  _onStart() {
    this.appLogger.success('Starting watch mode');
    this.appLogger.info(this.getPaths().map((directory) => `watching: ${directory}`));
  }

  /**
   * This is called when a source file changes and it's detected by the service.
   * The overwrite is just to show an information message.
   * @param {string} file The path to the file that changed.
   * @access protected
   * @ignore
   */
  _onChange(file) {
    this.appLogger.warning(`Change detected on ${file}`);
    super._onChange(file);
  }
  /**
   * This is called when a source file changes and the service can't find a matching path on neither
   * the transpilation paths nor the copy paths.
   * The method will just show an error message explaning the problem.
   * @access protected
   * @ignore
   */
  _onInvalidPathForChange() {
    this.appLogger.error('Error: The file directory is not on the list of allowed paths');
  }
  /**
   * Transpiles a file from a source directory into a build directory.
   * @param {string} source The path to the source file.
   * @param {string} output The path for the source file once transpiled.
   * @access protected
   * @ignore
   */
  _transpileFile(source, output) {
    try {
      // Make sure the path to the directory exists.
      fs.ensureDirSync(path.dirname(output));
      // Transpile the file.
      this.buildTranspiler.transpileFileSync({ source, output });
      this.appLogger.success('The file was successfully copied and transpiled');
    } catch (error) {
      this.appLogger.error('Error: The file couldn\'t be updated');
      this.appLogger.error(error);
    }
  }
  /**
   * Copies a file from a source directory into a build directory.
   * @param {string} from The original path of the file.
   * @param {string} to   The new path for the file.
   * @access protected
   * @ignore
   */
  _copyFile(from, to) {
    try {
      // Make sure the path to the directory exists.
      fs.ensureDirSync(path.dirname(to));
      // Copy the file.
      fs.copySync(from, to);
      this.appLogger.success('The file was successfully copied');
    } catch (error) {
      this.appLogger.error('Error: The file couldn\'t be copied');
      this.appLogger.error(error);
    }
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildNodeWatcherProcess` as the `buildNodeWatcherProcess` service.
 * @example
 * // Register it on the container
 * container.register(buildNodeWatcherProcess);
 * // Getting access to the service instance
 * const buildNodeWatcherProcess = container.get('buildNodeWatcherProcess');
 * @type {Provider}
 */
const buildNodeWatcherProcess = provider((app) => {
  app.set('buildNodeWatcherProcess', () => new BuildNodeWatcherProcess(
    app.get('appLogger'),
    app.get('buildTranspiler'),
    app.get('projectConfiguration').getConfig()
  ).watch);
});

module.exports = {
  BuildNodeWatcherProcess,
  buildNodeWatcherProcess,
};
