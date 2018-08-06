const path = require('path');
const Watchpack = require('watchpack');
/**
 * A helper class for creating services that rely on watching directories and copying and/or
 * transpiling files.
 * @abstract
 * @version 1.0
 */
class NodeWatcher {
  /**
   * @param {WatchpackOptions} [watchpackOptions={}] Custom options for `watchpack`, the library
   *                                                 being used to watch directories.
   */
  constructor(watchpackOptions = {}) {
    if (new.target === NodeWatcher) {
      throw new TypeError(
        'NodeWatcher is an abstract class, it can\'t be instantiated directly'
      );
    }
    /**
     * Whether or not the service is watching.
     * @type {boolean}
     */
    this.watching = false;
    /**
     * The custom options for `watchpack`. They're stored because the instance will be created
     * when {@link NodeWatcher#watch} is called.
     * @type {WatchpackOptions}
     * @access protected
     * @ignore
     */
    this._watchpackOptions = watchpackOptions;
    /**
     * This will be the instance of `watchpack` when the service starts watching the files.
     * @type {?Watchpack}
     */
    this._watcher = null;
    /**
     * This will be the list of paths the service will be watching.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._paths = [];
    /**
     * A list of dictionaries with `from` and `to` paths for transpilation. When a file change is
     * detected by `watchpack`, the service will try to match the file path with the `from`
     * property of one of the items, and if one is found, it will call the method to transpile
     * that file using item's paths.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._transpilationPaths = [];
    /**
     * A list of dictionaries with `from` and `to` paths for copying files. When a file change is
     * detected by `watchpack`, and if the file path doesn't match any of the transpilation paths,
     * the service will try to match the `from` of an item from this list. If one is found, it will
     * then call the method to copy that file using item's paths.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._copyPaths = [];
    /**
     * Bind the method in case is sent as reference.
     * @ignore
     */
    this.watch = this.watch.bind(this);
    /**
     * Bind the method as it will be sent to `watchpack` as reference.
     * @ignore
     */
    this._onChange = this._onChange.bind(this);
  }
  /**
   * Starts watching the directories.
   * @param {Array} paths                   The list of directories the service will watch.
   * @param {Array} [transpilationPaths=[]] A list of dictionaries with `from` and `to` paths for
   *                                        transpilation. When a file change is detected by the
   *                                        service, it will try to match the file path with the
   *                                        `from` property of one of the items, and if one is
   *                                        found, it will call the method to transpile that file
   *                                        using item's paths.
   * @param {Array} [copyPaths=[]]          A list of dictionaries with `from` and `to` paths for
   *                                        copying files. When a file change is detected by the
   *                                        service, and if the file path doesn't match any of
   *                                        the transpilation paths, it will try to match the
   *                                        `from` of an item from this list. If one is found, it
   *                                        will then call the method to copy that file using
   *                                        item's paths.
   * @return {Watchpack}
   */
  watch(paths, transpilationPaths = [], copyPaths = []) {
    if (this.watching) {
      throw new Error('The service is already watching, you can\'t call it more than once');
    } else if (!paths.length) {
      throw new Error('You need to specify at least one path to watch');
    } else if (!transpilationPaths.length && !copyPaths.length) {
      throw new Error('You need to provide at least one transpilation or copy path');
    }

    this.watching = true;
    this._paths = paths;
    this._transpilationPaths = transpilationPaths;
    this._copyPaths = copyPaths;

    this._onStart();

    this._watcher = new Watchpack(this._watchpackOptions);
    this._watcher.watch([], this._paths);
    this._watcher.on('change', this._onChange);
    return this._watcher;
  }
  /**
   * Stops watching the directories.
   */
  stop() {
    if (this._watcher) {
      this._watcher.close();
      this.watching = false;
    }
  }
  /**
   * Gets the list of paths the service is watching.
   * @return {Array}
   */
  getPaths() {
    return this._paths;
  }
  /**
   * This is called when the service is about to start watching the directories.
   * @access protected
   * @ignore
   */
  _onStart() {

  }
  /**
   * This method is called when `watchpack` detects a source file has changed. It checks if the
   * file path matches one of the transpilation paths or the copy paths in order to either
   * transpile or copy the file in to the _"build directory"_.
   * @param {string} file The path to the modified file.
   * @access protected
   * @ignore
   */
  _onChange(file) {
    // Try to find a matching item on the transpilation paths.
    const transpilationPath = this._transpilationPaths
    .find(({ from }) => file.startsWith(from));
    if (transpilationPath) {
      // If there's an item which `from` matched the file path, transpile the file.
      this._transpileFile(
        file,
        this._getFileNewPath(file, transpilationPath.from, transpilationPath.to)
      );
    } else {
      // If no item matched the file, try to find a copy path.
      const copyPath = this._copyPaths
      .find(({ from }) => file.startsWith(from));
      if (copyPath) {
        // If there's an item which `from` matched the file path, copy the file.
        this._copyFile(
          file,
          this._getFileNewPath(file, copyPath.from, copyPath.to)
        );
      } else {
        this._onInvalidPathForChange(file);
      }
    }
  }
  /**
   * This is called when a source file changes and the service can't find a matching path on neither
   * the transpilation paths nor the copy paths.
   * @param {string} file The path to the modified file.
   * @access protected
   * @ignore
   */
  _onInvalidPathForChange(file) {
    // To avoid a ESLint vs ESDoc issues.
    // eslint-disable-next-line no-unused-vars
    const ignore = file;
  }
  /**
   * Transpiles a file from a source directory into a build directory.
   * @param {string} source The path to the source file.
   * @param {string} output The path for the source file once transpiled.
   * @abstract
   * @access protected
   * @ignore
   */
  _transpileFile(source, output) {
    // To avoid a ESLint vs ESDoc issues.
    // eslint-disable-next-line no-unused-vars
    const ignore = { source, output };

    throw new Error('_transpileFile must be overwritten');
  }
  /**
   * Copies a file from a source directory into a build directory.
   * @param {string} from The original path of the file.
   * @param {string} to   The new path for the file.
   * @abstract
   * @access protected
   * @ignore
   */
  _copyFile(from, to) {
    // To avoid a ESLint vs ESDoc issues.
    // eslint-disable-next-line no-unused-vars
    const ignore = { from, to };

    throw new Error('_copyFile must be overwritten');
  }
  /**
   * Builds the path for a file that will be copied/transpiled fro its source directory into the
   * build directory.
   * @param {string} file The original path of the file.
   * @param {string} from The path to the source directory.
   * @param {string} to   The path to the build directory.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getFileNewPath(file, from, to) {
    // Remove the _"source directory"_ of the file path in order to have just the relative part.
    const relative = file.substr(from.length);
    // Create the new path the file will have once copied/transpiled.
    return path.join(to, relative);
  }
}

module.exports = NodeWatcher;
