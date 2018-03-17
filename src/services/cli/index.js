const { cliWithName, cli } = require('./cli');
const { cliBuildCommand } = require('./cliBuild');
const { cliCleanCommand } = require('./cliClean');
const { cliCopyProjectFilesCommand } = require('./cliCopyProjectFiles');
const { cliInfoCommand } = require('./cliInfo');
const { cliRevisionCommand } = require('./cliRevision');
const { cliRunCommand } = require('./cliRun');
const { cliSHBuildCommand } = require('./cliSHBuild');
const { cliSHCopyCommand } = require('./cliSHCopy');
const { cliSHNodeRunCommand } = require('./cliSHNodeRun');
const { cliSHRunCommand } = require('./cliSHRun');
const { cliSHTranspileCommand } = require('./cliSHTranspile');
const { cliSHValidateBuildCommand } = require('./cliSHValidateBuild');
const { cliSHValidateRunCommand } = require('./cliSHValidateRun');

module.exports = {
  cliWithName,
  cli,
  cliBuildCommand,
  cliCleanCommand,
  cliCopyProjectFilesCommand,
  cliInfoCommand,
  cliRevisionCommand,
  cliRunCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHNodeRunCommand,
  cliSHRunCommand,
  cliSHTranspileCommand,
  cliSHValidateBuildCommand,
  cliSHValidateRunCommand,
};
