const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {
  NoEmitOnErrorsPlugin,
  DefinePlugin,
  HotModuleReplacementPlugin,
} = require('webpack');
const { provider } = require('jimple');
const ConfigurationFile = require('../../../interfaces/configurationFile');

class WebpackBrowserDevelopmentConfiguration extends ConfigurationFile {
  constructor(
    events,
    pathUtils,
    projectConfiguration,
    webpackBaseConfiguration
  ) {
    super(
      pathUtils,
      'webpack/browser.development.config.js',
      true,
      webpackBaseConfiguration
    );
    this.events = events;
    this.projectConfiguration = projectConfiguration;
  }

  createConfig(params) {
    const {
      definitions,
      entry,
      target,
    } = params;
    const { paths: { output } } = this.projectConfiguration;

    const config = {
      entry,
      output: {
        path: `./${target.folders.build}`,
        filename: `${output.js}/[name].js`,
        publicPath: '/',
      },
    };

    if (target.hot) {
      const [entryName] = Object.keys(entry);
      config.entry[entryName].unshift('webpack-hot-middleware/client?reload=true');
    }

    if (target.sourceMap.development) {
      config.devtool = 'source-map';
    }

    config.plugins = [
      new ExtractTextPlugin(`${output.css}/${target.name}.css`),
      new HtmlWebpackPlugin(Object.assign({}, target.html, {
        template: path.join(target.paths.source, target.html.template),
        inject: 'body',
      })),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async',
      }),
      ...(target.hot ? [new HotModuleReplacementPlugin()] : []),
      new NoEmitOnErrorsPlugin(),
      new DefinePlugin(definitions),
      new OptimizeCssAssetsPlugin(),
    ];

    return this.events.reduce(
      'webpack-browser-development-configuration',
      config,
      params
    );
  }
}

const webpackBrowserDevelopmentConfiguration = provider((app) => {
  app.set(
    'webpackBrowserDevelopmentConfiguration',
    () => new WebpackBrowserDevelopmentConfiguration(
      app.get('events'),
      app.get('pathUtils'),
      app.get('projectConfiguration').getConfig(),
      app.get('webpackBaseConfiguration')
    )
  );
});

module.exports = {
  WebpackBrowserDevelopmentConfiguration,
  webpackBrowserDevelopmentConfiguration,
};
