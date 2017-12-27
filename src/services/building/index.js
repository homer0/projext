const { buildCleaner } = require('./buildCleaner');
const { buildCopier } = require('./buildCopier');
const { buildEngines } = require('./buildEngines');
const { buildNodeRunner } = require('./buildNodeRunner');
const { buildNodeRunnerProcess } = require('./buildNodeRunnerProcess');
const { buildTranspiler } = require('./buildTranspiler');
const { builder } = require('./builder');
const { targets } = require('./targets');

module.exports = {
  buildCleaner,
  buildCopier,
  buildEngines,
  buildNodeRunner,
  buildNodeRunnerProcess,
  buildTranspiler,
  builder,
  targets,
};
