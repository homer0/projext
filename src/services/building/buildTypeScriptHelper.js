const { provider } = require('jimple');
/**
 * This service works as a helper to generate TypeScript binary commands.
 */
class BuildTypeScriptHelper {
  /**
   * Class constructor.
   * @ignore
   */
  constructor() {
    /**
     * The path of the TypeScript binary that will execute the commands.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._bin = 'tsc';
  }
  /**
   * Gets the command that generates the TypeScript declaration file(s) for a target.
   * @param {Target} target The target from which the method will take the input (source) and
   *                        output (build) paths.
   * @return {string}
   */
  getDeclarationsCommand(target) {
    const {
      paths: {
        build,
        source,
      },
    } = target;
    return this._command(`--emitDeclarationOnly --outDir ${build} --rootDir ${source}`);
  }
  /**
   * Helper method that just puts the Typescript binary path on front of a set of instructions.
   * @param {string} instructions The instructions for the TypeScript binary.
   * @return {string}
   * @access protected
   * @ignore
   */
  _command(instructions) {
    return `${this._bin} ${instructions}`;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `BuildTypeScriptHelper` as the `buildTypeScriptHelper` service.
 * @example
 * // Register it on the container
 * container.register(buildTypeScriptHelper);
 * // Getting access to the service instance
 * const buildTypeScriptHelper = container.get('buildTypeScriptHelper');
 * @type {Provider}
 */
const buildTypeScriptHelper = provider((app) => {
  app.set('buildTypeScriptHelper', () => new BuildTypeScriptHelper());
});

module.exports = {
  BuildTypeScriptHelper,
  buildTypeScriptHelper,
};
