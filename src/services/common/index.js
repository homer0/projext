const { cleaner } = require('./cleaner');
const { copier } = require('./copier');
const { events } = require('./events');
const { plugins } = require('./plugins');
const { promptWithOptions, prompt, appPrompt } = require('./prompt');
const { tempFiles } = require('./tempFiles');
const { utils } = require('./utils');
const { versionUtils } = require('./versionUtils');

module.exports = {
  appPrompt,
  cleaner,
  copier,
  events,
  plugins,
  promptWithOptions,
  prompt,
  tempFiles,
  utils,
  versionUtils,
};
