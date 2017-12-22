const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { provider } = require('jimple');
const ConfigurationFile = require('../../../interfaces/configurationFile');

class WebpackBrowserProductionConfiguration extends ConfigurationFile {
  constructor(
    events,
    pathUtils,
    projectConfiguration,
    webpackBaseConfiguration
  ) {
    super(
      pathUtils,
      'webpack/browser.production.config.js',
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
      hashStr,
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

    if (target.sourceMap.production) {
      config.devtool = 'source-map';
    }

    config.plugins = [
      new ExtractTextPlugin(`${output.css}/${target.name}${hashStr}.css`),
      new HtmlWebpackPlugin(Object.assign({}, target.html, {
        template: path.join(target.paths.source, target.html.template),
        inject: 'body',
      })),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async',
      }),
      new DefinePlugin(definitions),
      new UglifyJSPlugin({
        sourceMap: target.sourceMap.production,
      }),
      new OptimizeCssAssetsPlugin(),
      new CompressionPlugin(),
    ];

    return this.events.reduce(
      'webpack-browser-production-configuration',
      config,
      params
    );
  }
}

const webpackBrowserProductionConfiguration = provider((app) => {
  app.set(
    'webpackBrowserProductionConfiguration',
    () => new WebpackBrowserProductionConfiguration(
      app.get('events'),
      app.get('pathUtils'),
      app.get('projectConfiguration').getConfig(),
      app.get('webpackBaseConfiguration')
    )
  );
});

module.exports = {
  WebpackBrowserProductionConfiguration,
  webpackBrowserProductionConfiguration,
};
