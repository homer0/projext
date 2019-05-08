const extend = require('extend');
const fs = require('fs-extra');
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
   * @param {PathUtils}          pathUtils     Because `ConfigurationFile` needs it in order to
   *                                           build the overwrite path.
   * @param {Plugins}            plugins       To get the list of loaded plugins and decide the
   *                                           default build engine.
   * @param {TargetsFinder#find} targetsFinder If the configuration is not overwritten, the
   *                                           service will use this to look for existing targets
   *                                           based on the files andor folders on the source
   *                                           directory.
   */
  constructor(pathUtils, plugins, targetsFinder) {
    // Set the overwrite file path.
    super(pathUtils, [
      'projext.config.js',
      'config/projext.config.js',
      'config/project.config.js',
    ]);
    /**
     * A local reference for the `plugins` service.
     * @type {Plugins}
     */
    this.plugins = plugins;
    /**
     * A local reference for the `targetsFinder` service.
     * @type {TargetsFinder#find}
     */
    this.targetsFinder = targetsFinder;
    /**
     * The list of known build engine plugins that can be used with projext. This service
     * will validate which one is installed in order to decide the default value of the `engine`
     * settings for the targets.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._knownBuildEndgines = ['webpack', 'rollup'];
  }
  /**
   * Create the project configuration with all its _'smart defaults'_.
   * @return {ProjectConfigurationSettings}
   */
  createConfig() {
    const engine = this._getDefaultBuildEngine();
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
          engine,
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
          sourceMap: {
            development: false,
            production: true,
          },
          inspect: {
            enabled: false,
            host: '0.0.0.0',
            port: 9229,
            command: 'inspect',
            ndb: false,
          },
          css: {
            modules: false,
          },
          includeModules: [],
          excludeModules: [],
          includeTargets: [],
          runOnDevelopment: false,
          watch: {
            development: false,
            production: false,
          },
          babel: {
            features: {
              decorators: false,
              classProperties: false,
              dynamicImports: true,
              objectRestSpread: false,
            },
            nodeVersion: 'current',
            overwrites: {},
          },
          flow: false,
          typeScript: false,
          library: false,
          libraryOptions: {
            libraryTarget: 'commonjs2',
          },
          cleanBeforeBuild: true,
          copy: [],
        },
        browser: {
          type: 'browser',
          engine,
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
          includeTargets: [],
          uglifyOnProduction: true,
          runOnDevelopment: false,
          watch: {
            development: false,
            production: false,
          },
          babel: {
            features: {
              decorators: false,
              classProperties: false,
              dynamicImports: true,
              objectRestSpread: false,
            },
            browserVersions: 2,
            mobileSupport: true,
            polyfill: true,
            overwrites: {},
          },
          flow: false,
          typeScript: false,
          hot: false,
          library: false,
          libraryOptions: {
            libraryTarget: 'umd',
            compress: false,
          },
          cleanBeforeBuild: true,
          copy: [],
          devServer: {
            port: 2509,
            open: true,
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
            historyApiFallback: true,
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
      plugins: {
        enabled: true,
        list: [],
      },
      others: {
        findTargets: {
          enabled: true,
        },
        watch: {
          poll: true,
        },
        nodemon: {
          legacyWatch: false,
        },
      },
    };
  }
  /**
   * This is the real method that creates and extends the configuration. It's being overwritten
   * for two reasons:
   * 1. In order to check if the targets finder should try to find the targets information by
   * reading the source directory or not.
   * 2. To check for custom plugins and load them.
   * @param  {Array} args A list of parameters for the service to use when creating the
   *                      configuration. This gets send from {@link ConfigurationFile#getConfig}
   * @ignore
   * @access protected
   */
  _loadConfig(...args) {
    super._loadConfig(...args);
    if (this._config.others.findTargets.enabled) {
      const originalTargets = extend(true, {}, this._config.targets);
      const originalTargetsNames = Object.keys(originalTargets);
      const foundTargets = this._findTargets();
      const foundTargetsNames = Object.keys(foundTargets);
      /**
       * If there's only one target on the configuration file and the finder only found one, the
       * name of the found one will be changed to the one on the configuration file.
       *
       * When a single target, outside a folder, is found, the finder will give it the same name
       * as the project name on the `package.json`, but by defining a single target on the
       * configuration file, the name can be changed.
       */
      if (originalTargetsNames.length === 1 && foundTargetsNames.length === 1) {
        const [originalTargetName] = originalTargetsNames;
        const [foundTargetName] = foundTargetsNames;
        if (originalTargetName !== foundTargetName) {
          foundTargets[originalTargetName] = foundTargets[foundTargetName];
          foundTargets[originalTargetName].name = originalTargetName;
          delete foundTargets[foundTargetName];
        }
      }
      this._config.targets = extend(true, {}, foundTargets, originalTargets);
    }
    // If custom plugins are enabled...
    if (this._config.plugins.enabled) {
      /**
       * First check if one of the _"known plugins"_ exist, then append the list of plugins
       * defined on the configuration and finally try to load them.
       */
      this._validatePlugins(this._config.plugins.list)
      .forEach((pluginFile) => this.plugins.loadFromFile(pluginFile));
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
  /**
   * Gets the name of the default build engine that the service will use as default for the
   * targets templates. It finds the name by using a list of known engines and checking if any of
   * them was loaded as a plugin.
   * @return {string}
   * @access protected
   * @ignore
   */
  _getDefaultBuildEngine() {
    return this._knownBuildEndgines.find((engine) => this.plugins.loaded(engine));
  }
  /**
   * This method validates if any of the _"known plugin paths"_ exists and add them to the top
   * of the list.
   * @param {Array} definedPlugins The list of plugin paths defined on the configuration.
   * @return {Array}
   * @access protected
   * @ignore
   */
  _validatePlugins(definedPlugins) {
    const knownPlugins = [
      'projext.plugin.js',
      'config/projext.plugin.js',
    ];

    return [
      ...knownPlugins.filter((pluginPath) => fs.pathExistsSync(this.pathUtils.join(pluginPath))),
      ...definedPlugins,
    ];
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
    app.get('plugins'),
    app.get('targetsFinder')
  ));
});

module.exports = {
  ProjectConfiguration,
  projectConfiguration,
};
