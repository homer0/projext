const { cliWithName, cli } = require('./cli');
const { cliBuildCommand } = require('./cliBuild');
const { cliSHBuildCommand } = require('./cliSHBuild');
const { cliSHCopyCommand } = require('./cliSHCopy');
const { cliSHTranspileCommand } = require('./cliSHTranspile');

module.exports = {
  cliWithName,
  cli,
  cliBuildCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHTranspileCommand,
};
