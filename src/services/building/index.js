const { buildCleaner } = require('./buildCleaner');
const { buildCopier } = require('./buildCopier');
const { buildEngines } = require('./buildEngines');
const { buildTranspiler } = require('./buildTranspiler');
const { builder } = require('./builder');
const { targets } = require('./targets');

module.exports = {
  buildCleaner,
  buildCopier,
  buildEngines,
  buildTranspiler,
  builder,
  targets,
};
