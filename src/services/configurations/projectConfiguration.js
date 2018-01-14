const { provider } = require('jimple');
const ConfigurationFile = require('../../interfaces/configurationFile');

class ProjectConfiguration extends ConfigurationFile {
  constructor(pathUtils) {
    super(pathUtils, 'project.config.js');
  }

  createConfig() {
    return {
      version: {
        replaceKey: 'APP_VERSION',
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
      paths: {
        source: 'src',
        build: 'dist',
        privateModules: 'private',
        output: {
          js: 'statics/js',
          fonts: 'statics/fonts',
          css: 'statics/css',
          images: 'statics/img',
        },
      },
      targetsTemplates: {
        node: {
          type: 'node',
          engine: 'webpack',
          hasFolder: true,
          folder: '',
          createFolder: false,
          entry: {
            development: 'start.development.js',
            production: 'start.production.js',
          },
          transpile: false,
          bundle: false,
          runOnDevelopment: false,
          babel: {
            features: [],
            nodeVersion: 'current',
            overwrites: {},
          },
          flow: false,
          library: false,
          libraryOptions: {},
          cleanBeforeBuild: true,
        },
        browser: {
          type: 'browser',
          engine: 'webpack',
          hasFolder: true,
          folder: '',
          createFolder: true,
          entry: {
            development: 'index.js',
            production: 'index.js',
          },
          sourceMap: {
            development: false,
            production: true,
          },
          html: {
            template: 'index.html',
            filename: 'index.html',
          },
          runOnDevelopment: false,
          babel: {
            features: [],
            browserVersions: 2,
            mobileSupport: true,
            overwrites: {},
            polyfill: true,
          },
          flow: false,
          CSSModules: false,
          hotReload: false,
          library: false,
          libraryOptions: {},
          cleanBeforeBuild: true,
          devServer: {
            port: 2509,
            reload: true,
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
        items: [
          '.nvmrc',
          'config',
          'package.json',
        ],
        copyOnBuild: {
          enabled: true,
          onlyOnProduction: true,
          targets: [],
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

const projectConfiguration = provider((app) => {
  app.set('projectConfiguration', () => new ProjectConfiguration(
    app.get('pathUtils')
  ));
});

module.exports = {
  ProjectConfiguration,
  projectConfiguration,
};
