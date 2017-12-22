const { webpackBaseConfiguration } = require('./baseConfiguration');
const {
  webpackBrowserDevelopmentConfiguration,
} = require('./browserDevelopmentConfiguration');
const {
  webpackBrowserProductionConfiguration,
} = require('./browserProductionConfiguration');
const {
  webpackLoadersConfiguration,
} = require('./loadersConfiguration');
const {
  webpackNodeDevelopmentConfiguration,
} = require('./nodeDevelopmentConfiguration');
const {
  webpackNodeProductionConfiguration,
} = require('./nodeProductionConfiguration');

module.exports = {
  webpackBaseConfiguration,
  webpackBrowserDevelopmentConfiguration,
  webpackBrowserProductionConfiguration,
  webpackLoadersConfiguration,
  webpackNodeDevelopmentConfiguration,
  webpackNodeProductionConfiguration,
};
