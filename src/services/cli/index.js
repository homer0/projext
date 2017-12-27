const { cliWithName, cli } = require('./cli');
const { cliBuildCommand } = require('./cliBuild');
const { cliCleanCommand } = require('./cliClean');
const { cliCopyProjectFilesCommand } = require('./cliCopyProjectFiles');
const { cliRevisionCommand } = require('./cliRevision');
const { cliSHBuildCommand } = require('./cliSHBuild');
const { cliSHCopyCommand } = require('./cliSHCopy');
const { cliSHTranspileCommand } = require('./cliSHTranspile');
const { cliSHValidateBuildCommand } = require('./cliSHValidateBuild');

module.exports = {
  cliWithName,
  cli,
  cliBuildCommand,
  cliCleanCommand,
  cliCopyProjectFilesCommand,
  cliRevisionCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHTranspileCommand,
  cliSHValidateBuildCommand,
};
