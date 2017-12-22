const { buildCleaner } = require('./buildCleaner');
const { buildCopier } = require('./buildCopier');
const { buildEngines } = require('./buildEngines');
const { targets } = require('./targets');

module.exports = {
  buildCleaner,
  buildCopier,
  buildEngines,
  targets,
};
