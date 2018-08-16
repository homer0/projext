const { cliWithName, cli } = require('./cli');
const { cliBuildCommand } = require('./cliBuild');
const { cliCleanCommand } = require('./cliClean');
const { cliCopyProjectFilesCommand } = require('./cliCopyProjectFiles');
const { cliGenerateCommand } = require('./cliGenerate');
const { cliInfoCommand } = require('./cliInfo');
const { cliInspectCommand } = require('./cliInspect');
const { cliRevisionCommand } = require('./cliRevision');
const { cliRunCommand } = require('./cliRun');
const { cliSHBuildCommand } = require('./cliSHBuild');
const { cliSHCopyCommand } = require('./cliSHCopy');
const { cliSHInspectCommand } = require('./cliSHInspect');
const { cliSHNodeRunCommand } = require('./cliSHNodeRun');
const { cliSHNodeWatchCommand } = require('./cliSHNodeWatch');
const { cliSHRunCommand } = require('./cliSHRun');
const { cliSHTranspileCommand } = require('./cliSHTranspile');
const { cliSHValidateBuildCommand } = require('./cliSHValidateBuild');
const { cliSHValidateInspectCommand } = require('./cliSHValidateInspect');
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
  cliInspectCommand,
  cliRevisionCommand,
  cliRunCommand,
  cliSHBuildCommand,
  cliSHCopyCommand,
  cliSHInspectCommand,
  cliSHNodeRunCommand,
  cliSHNodeWatchCommand,
  cliSHRunCommand,
  cliSHTranspileCommand,
  cliSHValidateBuildCommand,
  cliSHValidateInspectCommand,
  cliSHValidateRunCommand,
  cliGenerators,
  cliSHValidateWatchCommand,
  cliSHWatchCommand,
  cliWatchCommand,
};
