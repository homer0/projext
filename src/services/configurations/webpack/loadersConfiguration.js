const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { provider } = require('jimple');
const ConfigurationFile = require('../../../interfaces/configurationFile');

class WebpackLoadersConfiguration extends ConfigurationFile {
  constructor(babelConfiguration, events, pathUtils, projectConfiguration) {
    super(pathUtils, 'webpack/loaders.config.js');
    this.babelConfiguration = babelConfiguration;
    this.events = events;
    this.projectConfiguration = projectConfiguration;
  }

  createConfig(params) {
    return params.target.is.node ?
      this.createNodeConfig(params) :
      this.createBrowserConfig(params);
  }

  createNodeConfig(params) {
    const { target: { bundle } } = params;
    const loaders = [
      ...this.getJSLoaders(params, 'webpack-js-loaders-configuration-for-node'),
      ...(
        bundle ?
          this.getVersionLoaders(params, 'webpack-version-loaders-configuration-for-node') :
          []
      ),
    ];

    return this.events.reduce('webpack-loaders-configuration-for-node', loaders, params);
  }

  createBrowserConfig(params) {
    const loaders = [
      ...this.getJSLoaders(params, 'webpack-js-loaders-configuration-for-browser'),
      ...this.getVersionLoaders(params, 'webpack-version-loaders-configuration-for-browser'),
      ...this.getSCSSLoaders(params),
      ...this.getCSSLoaders(params),
      ...this.getHTMLLoaders(params),
      ...this.getFontsLoaders(params),
      ...this.getImagesLoaders(params),
      ...this.getFaviconsLoaders(params),
    ];

    return this.events.reduce('webpack-loaders-configuration-for-browser', loaders, params);
  }

  getJSLoaders(params, eventName) {
    const loaders = [{
      test: /\.jsx?$/i,
      include: [RegExp(params.target.folders.source)],
      use: [{
        loader: 'babel-loader',
        options: this.babelConfiguration.getConfigForTarget(params.target),
      }],
    }];

    return this.events.reduce(eventName, loaders, params);
  }

  getSCSSLoaders(params) {
    const cssLoaderConfig = {
      importLoaders: 2,
    };

    if (params.target.CSSModules) {
      cssLoaderConfig.modules = true;
      cssLoaderConfig.localIdentName = '[name]__[local]___[hash:base64:5]';
    }

    const loaders = [{
      test: /\.scss$/i,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
            query: cssLoaderConfig,
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              outputStyle: 'expanded',
              includePaths: ['node_modules'],
            },
          },
        ],
      }),
    }];

    return this.events.reduce('webpack-scss-loaders-configuration-for-browser', loaders, params);
  }

  getCSSLoaders(params) {
    const loaders = [{
      test: /\.css$/i,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          'css-loader',
        ],
      }),
    }];

    return this.events.reduce('webpack-css-loaders-configuration-for-browser', loaders, params);
  }

  getHTMLLoaders(params) {
    const loaders = [{
      test: /\.html?$/,
      exclude: /\.tpl\.html/,
      use: [
        'raw-loader',
      ],
    }];

    return this.events.reduce('webpack-html-loaders-configuration-for-browser', loaders, params);
  }

  getVersionLoaders(params, eventName) {
    const { version } = this.projectConfiguration;
    const loaders = [{
      test: /config\.js$/,
      include: /config/,
      use: [{
        loader: 'string-replace-loader',
        options: {
          search: RegExp(`{{${version.replaceKey}}}`, 'g'),
          replace: params.version,
        },
      }],
    }];

    return this.events.reduce(eventName, loaders, params);
  }

  getFontsLoader(params) {
    const { paths: { output: { fonts } } } = this.projectConfiguration;
    const { hashStr } = params;
    const name = `${fonts}/[name]${hashStr}.[ext]`;
    const loaders = [
      {
        test: /\.svg(\?(v=\d+\.\d+\.\d+|\w+))?$/,
        include: /fonts/,
        use: [{
          loader: 'file-loader',
          options: {
            name,
            mimetype: 'image/svg+xml',
          },
        }],
      },
      {
        test: /\.woff(\?(v=\d+\.\d+\.\d+|\w+))?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name,
            mimetype: 'application/font-woff',
          },
        }],
      },
      {
        test: /\.woff2(\?(v=\d+\.\d+\.\d+|\w+))?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name,
            mimetype: 'application/font-woff',
          },
        }],
      },
      {
        test: /\.ttf(\?(v=\d+\.\d+\.\d+|\w+))?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name,
            mimetype: 'application/octet-stream',
          },
        }],
      },
      {
        test: /\.eot(\?(v=\d+\.\d+\.\d+|\w+))?$/,
        use: [{
          loader: 'file-loader',
          options: { name },
        }],
      },
    ];

    return this.events.reduce('webpack-fonts-loaders-configuration-for-browser', loaders, params);
  }

  getImagesLoaders(params) {
    const { paths: { output: { images } } } = this.projectConfiguration;
    const { hashStr } = params;
    const loaders = [{
      test: /\.(jpe?g|png|gif|svg|ico)$/i,
      exclude: /favicon/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: `${images}/[name]${hashStr}.[ext]`,
            digest: 'hex',
          },
        },
        {
          loader: 'image-webpack-loader',
          query: {
            mozjpeg: {
              progressive: true,
            },
            gifsicle: {
              interlaced: false,
            },
            optipng: {
              optimizationLevel: 7,
            },
            pngquant: {
              quality: '75-90',
              speed: 3,
            },
          },
        },
      ],
    }];

    return this.events.reduce('webpack-images-loaders-configuration-for-browser', loaders, params);
  }

  getFaviconsLoaders(params) {
    const loaders = [{
      test: /\.(png|ico)$/i,
      include: /favicon/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            digest: 'hex',
          },
        },
        {
          loader: 'image-webpack-loader',
          query: {
            optipng: {
              optimizationLevel: 7,
            },
            pngquant: {
              quality: '75-90',
              speed: 3,
            },
          },
        },
      ],
    }];

    return this.events.reduce(
      'webpack-favicons-loaders-configuration-for-browser',
      loaders,
      params
    );
  }
}

const webpackLoadersConfiguration = provider((app) => {
  app.set('webpackLoadersConfiguration', () => new WebpackLoadersConfiguration(
    app.get('babelConfiguration'),
    app.get('events'),
    app.get('pathUtils'),
    app.get('projectConfiguration').getConfig()
  ));
});

module.exports = {
  WebpackLoadersConfiguration,
  webpackLoadersConfiguration,
};
