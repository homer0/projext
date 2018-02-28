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
   * @param {PathUtils} pathUtils Because `ConfigurationFile` needs it in order to build the
   *                              overwrite path.
   */
  constructor(pathUtils) {
    // Set the overwrite file path.
    super(pathUtils, 'project.config.js');
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
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
            development: {
              fonts: 'statics/fonts/[name].[ext]',
              css: 'statics/styles/[target-name].css',
              images: 'statics/images/[name].[ext]',
            },
            production: null,
          },
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
              fonts: 'statics/fonts/[name].[hash].[ext]',
              css: 'statics/styles/[target-name].[hash].css',
              images: 'statics/images/[name].[hash].[ext]',
            },
            development: {
              js: 'statics/js/[target-name].js',
              fonts: 'statics/fonts/[name].[ext]',
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
          runOnDevelopment: false,
          babel: {
            features: [],
            browserVersions: 2,
            mobileSupport: true,
            polyfill: true,
            overwrites: {},
          },
          flow: false,
          CSSModules: false,
          hot: false,
          library: false,
          libraryOptions: {
            libraryTarget: 'umd',
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
              https: false,
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
        watch: {
          poll: true,
        },
      },
    };
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
    app.get('pathUtils')
  ));
});

module.exports = {
  ProjectConfiguration,
  projectConfiguration,
};
