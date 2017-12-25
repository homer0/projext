const { cliWithName, cli } = require('./cli');
const { cliBuildCommand } = require('./cliBuild');
const { cliCopyProjectFilesCommand } = require('./cliCopyProjectFiles');
const { cliRevisionCommand } = require('./cliRevision');
const { cliSHBuildCommand } = require('./cliSHBuild');
const { cliSHCopyCommand } = require('./cliSHCopy');
const { cliSHTranspileCommand } = require('./cliSHTranspile');

module.exports = {
  cliWithName,
  cli,
  cliBuildCommand,
  cliCopyProjectFilesCommand,
  cliRevisionCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHTranspileCommand,
};
