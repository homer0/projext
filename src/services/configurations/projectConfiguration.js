const extend = require('extend');
const { provider } = require('jimple');
const ConfigurationFile = require('../../abstracts/configurationFile');
/**
 * Here's the configuration with all the _'magic defaults'_ the app uses. This service generates
 * the project configuration with all settings and features projext uses.
 * This configuration is ALWAYS overwritten and extended in order to define the targets.
 * @extends {ConfigurationFile}
 */
class ProjectConfiguration extends ConfigurationFile {
  /**
   * Class constructor.
   * @param {PathUtils}     pathUtils          Because `ConfigurationFile` needs it in order to
   *                                           build the overwrite path.
   * @param {TargetsFinder#find} targetsFinder If the configuration is not overwritten, the service
   *                                           will use this to look for existing targets based on
   *                                           the files and/or folders on the source directory.
   */
  constructor(pathUtils, targetsFinder) {
    // Set the overwrite file path.
    super(pathUtils, [
      'projext.config.js',
      'config/projext.config.js',
      'config/project.config.js',
    ]);
    /**
     * A local reference for the `targetsFinder` service.
     * @type {TargetsFinder#find}
     */
    this.targetsFinder = targetsFinder;
  }
  /**
   * Create the project configuration with all its _'smart defaults'_.
   * @return {ProjectConfigurationSettings}
   */
  createConfig() {
    return {
      paths: {
        source: 'src',
        build: 'dist',
        privateModules: 'private',
      },
      targetsTemplates: {
        node: {
          type: 'node',
          bundle: false,
          transpile: false,
          engine: 'webpack',
          hasFolder: true,
          createFolder: false,
          folder: '',
          entry: {
            default: 'index.js',
            development: null,
            production: null,
          },
          output: {
            default: {
              js: '[target-name].js',
              fonts: 'statics/fonts/[name]/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
            development: {
              fonts: 'statics/fonts/[name]/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: null,
          },
          css: {
            modules: false,
          },
          includeModules: [],
          excludeModules: [],
          runOnDevelopment: false,
          babel: {
            features: [],
            nodeVersion: 'current',
            overwrites: {},
          },
          flow: false,
          library: false,
          libraryOptions: {
            libraryTarget: 'commonjs2',
          },
          cleanBeforeBuild: true,
        },
        browser: {
          type: 'browser',
          engine: 'webpack',
          hasFolder: true,
          createFolder: true,
          folder: '',
          entry: {
            default: 'index.js',
            development: null,
            production: null,
          },
          output: {
            default: {
              js: 'statics/js/[target-name].[hash].js',
              fonts: 'statics/fonts/[name]/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
            development: {
              js: 'statics/js/[target-name].js',
              fonts: 'statics/fonts/[name]/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: null,
          },
          sourceMap: {
            development: false,
            production: true,
          },
          html: {
            default: 'index.html',
            template: null,
            filename: null,
          },
          css: {
            modules: false,
            inject: false,
          },
          includeModules: [],
          runOnDevelopment: false,
          babel: {
            features: [],
            browserVersions: 2,
            mobileSupport: true,
            polyfill: true,
            overwrites: {},
          },
          flow: false,
          hot: false,
          library: false,
          libraryOptions: {
            libraryTarget: 'umd',
            compress: false,
          },
          cleanBeforeBuild: true,
          devServer: {
            port: 2509,
            reload: true,
            host: 'localhost',
            ssl: {
              key: null,
              cert: null,
              ca: null,
            },
            proxied: {
              enabled: false,
              host: null,
              https: null,
            },
          },
          configuration: {
            enabled: false,
            default: null,
            path: 'config/',
            hasFolder: true,
            defineOn: 'process.env.CONFIG',
            environmentVariable: 'CONFIG',
            loadFromEnvironment: true,
            filenameFormat: '[target-name].[configuration-name].config.js',
          },
        },
      },
      targets: {},
      copy: {
        enabled: false,
        items: [],
        copyOnBuild: {
          enabled: true,
          onlyOnProduction: true,
          targets: [],
        },
      },
      version: {
        defineOn: 'process.env.VERSION',
        environmentVariable: 'VERSION',
        revision: {
          enabled: false,
          copy: true,
          filename: 'revision',
          createRevisionOnBuild: {
            enabled: true,
            onlyOnProduction: true,
            targets: [],
          },
        },
      },
      others: {
        findTargets: {
          enabled: true,
        },
        watch: {
          poll: true,
        },
      },
    };
  }
  /**
   * This is the real method that creates and extends the configuration. It's being overwritten in
   * order to check if the targets finder should try to find the targets information by reading
   * the source directory or not.
   * @param  {Array} args A list of parameters for the service to use when creating the
   *                      configuration. This gets send from {@link ConfigurationFile#getConfig}
   * @ignore
   * @access protected
   */
  _loadConfig(...args) {
    super._loadConfig(...args);
    if (this._config.others.findTargets.enabled) {
      const originalTargets = extend(true, {}, this._config.targets);
      const foundTargets = this._findTargets();
      this._config.targets = extend(true, {}, foundTargets, originalTargets);
    }
  }
  /**
   * It tries to find basic targets information by reading the source directory.
   * @return {Object} If there were targets to be found, this will be a dictionary of
   *                  {@link TargetsFinderTarget}, with the targets name as keys.
   * @ignore
   * @access protected
   */
  _findTargets() {
    const result = {};
    this.targetsFinder(this._config.paths.source)
    .forEach((target) => {
      result[target.name] = target;
    });

    return result;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `ProjectConfiguration` as the `projectConfiguration` service.
 * @example
 * // Register it on the container
 * container.register(projectConfiguration);
 * // Getting access to the service instance
 * const projectConfiguration = container.get('projectConfiguration');
 * @type {Provider}
 */
const projectConfiguration = provider((app) => {
  app.set('projectConfiguration', () => new ProjectConfiguration(
    app.get('pathUtils'),
    app.get('targetsFinder')
  ));
});

module.exports = {
  ProjectConfiguration,
  projectConfiguration,
};
