const { buildCleaner } = require('./buildCleaner');
const { buildCopier } = require('./buildCopier');
const { buildEngines } = require('./buildEngines');
const { builder } = require('./builder');
const { targets } = require('./targets');

module.exports = {
  buildCleaner,
  buildCopier,
  buildEngines,
  builder,
  targets,
};
