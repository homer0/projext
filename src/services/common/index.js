const { cleaner } = require('./cleaner');
const { copier } = require('./copier');
const { events } = require('./events');
const { plugins } = require('./plugins');
const { tempFiles } = require('./tempFiles');
const { utils } = require('./utils');
const { versionUtils } = require('./versionUtils');

module.exports = {
  cleaner,
  copier,
  events,
  plugins,
  tempFiles,
  utils,
  versionUtils,
};
