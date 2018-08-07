const { cliWithName, cli } = require('./cli');
const { cliBuildCommand } = require('./cliBuild');
const { cliCleanCommand } = require('./cliClean');
const { cliCopyProjectFilesCommand } = require('./cliCopyProjectFiles');
const { cliGenerateCommand } = require('./cliGenerate');
const { cliInfoCommand } = require('./cliInfo');
const { cliRevisionCommand } = require('./cliRevision');
const { cliRunCommand } = require('./cliRun');
const { cliSHBuildCommand } = require('./cliSHBuild');
const { cliSHCopyCommand } = require('./cliSHCopy');
const { cliSHNodeRunCommand } = require('./cliSHNodeRun');
const { cliSHNodeWatchCommand } = require('./cliSHNodeWatch');
const { cliSHRunCommand } = require('./cliSHRun');
const { cliSHTranspileCommand } = require('./cliSHTranspile');
const { cliSHValidateBuildCommand } = require('./cliSHValidateBuild');
const { cliSHValidateRunCommand } = require('./cliSHValidateRun');
const { cliSHValidateWatchCommand } = require('./cliSHValidateWatch');
const { cliSHWatchCommand } = require('./cliSHWatch');
const { cliWatchCommand } = require('./cliWatch');
const cliGenerators = require('./generators');

module.exports = {
  cliWithName,
  cli,
  cliBuildCommand,
  cliCleanCommand,
  cliCopyProjectFilesCommand,
  cliGenerateCommand,
  cliInfoCommand,
  cliRevisionCommand,
  cliRunCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHNodeRunCommand,
  cliSHNodeWatchCommand,
  cliSHRunCommand,
  cliSHTranspileCommand,
  cliSHValidateBuildCommand,
  cliSHValidateRunCommand,
  cliGenerators,
  cliSHValidateWatchCommand,
  cliSHWatchCommand,
  cliWatchCommand,
};
