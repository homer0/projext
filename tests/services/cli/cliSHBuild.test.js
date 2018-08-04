const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHBuild');

require('jasmine-expect');
const {
  CLISHBuildCommand,
  cliSHBuildCommand,
} = require('/src/services/cli/cliSHBuild');

describe('services/cli:sh-build', () => {
  const getTestForTheBuildCommand = () => {
    // Given
    const test = {};
    test.targetName = 'some-target';
    test.target = {
      name: test.targetName,
      transpile: false,
      bundle: false,
      cleanBeforeBuild: true,
      is: {
        node: true,
      },
      watch: {
        production: false,
        development: false,
      },
    };

    test.buildCommand = 'build';
    test.builder = {
      getTargetBuildCommand: jest.fn(() => test.buildCommand),
    };
    test.cleanCommand = 'clean';
    test.cliCleanCommand = {
      generate: jest.fn(() => test.cleanCommand),
    };
    test.copyProjectFilesCommand = 'copy-project-files';
    test.cliCopyProjectFilesCommand = {
      generate: jest.fn(() => test.copyProjectFilesCommand),
    };
    test.revisionCommand = 'revision';
    test.cliRevisionCommand = {
      generate: jest.fn(() => test.revisionCommand),
    };
    test.copyCommand = 'copy';
    test.cliSHCopyCommand = {
      generate: jest.fn(() => test.copyCommand),
    };
    test.runCommand = 'run';
    test.cliSHNodeRunCommand = {
      generate: jest.fn(() => test.runCommand),
    };
    test.watchCommand = '';
    test.transpileCommand = 'transpile';
    test.cliSHTranspileCommand = {
      generate: jest.fn(() => test.transpileCommand),
    };
    test.events = {
      reduce: jest.fn((name, commands) => commands),
    };
    test.projectConfiguration = {
      copy: {
        enabled: true,
        copyOnBuild: {
          onlyOnProduction: true,
          enabled: false,
          targets: [],
        },
      },
      version: {
        revision: {
          enabled: true,
          createRevisionOnBuild: {
            onlyOnProduction: true,
            enabled: false,
            targets: [],
          },
        },
      },
    };
    test.targets = {
      getTarget: jest.fn(() => test.target),
      getDefaultTarget: jest.fn(() => test.target),
    };
    test.sut = new CLISHBuildCommand(
      test.builder,
      test.cliCleanCommand,
      test.cliCopyProjectFilesCommand,
      test.cliRevisionCommand,
      test.cliSHCopyCommand,
      test.cliSHNodeRunCommand,
      test.cliSHTranspileCommand,
      test.events,
      test.projectConfiguration,
      test.targets
    );
    test.run = (
      type,
      run,
      watch,
      name = test.targetName,
      unknownOptions = {}
    ) => test.sut.handle(name, null, { type, run, watch }, unknownOptions);

    return test;
  };

  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const builder = 'builder';
    const cliCleanCommand = 'cliCleanCommand';
    const cliCopyProjectFilesCommand = 'cliCopyProjectFilesCommand';
    const cliRevisionCommand = 'cliRevisionCommand';
    const cliSHCopyCommand = 'cliSHCopyCommand';
    const cliSHNodeRunCommand = 'cliSHNodeRunCommand';
    const cliSHTranspileCommand = 'cliSHTranspileCommand';
    const events = 'events';
    const projectConfiguration = 'projectConfiguration';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new CLISHBuildCommand(
      builder,
      cliCleanCommand,
      cliCopyProjectFilesCommand,
      cliRevisionCommand,
      cliSHCopyCommand,
      cliSHNodeRunCommand,
      cliSHTranspileCommand,
      events,
      projectConfiguration,
      targets
    );
    // Then
    expect(sut).toBeInstanceOf(CLISHBuildCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.builder).toBe(builder);
    expect(sut.cliCleanCommand).toBe(cliCleanCommand);
    expect(sut.cliCopyProjectFilesCommand).toBe(cliCopyProjectFilesCommand);
    expect(sut.cliRevisionCommand).toBe(cliRevisionCommand);
    expect(sut.cliSHCopyCommand).toBe(cliSHCopyCommand);
    expect(sut.cliSHNodeRunCommand).toBe(cliSHNodeRunCommand);
    expect(sut.cliSHTranspileCommand).toBe(cliSHTranspileCommand);
    expect(sut.events).toBe(events);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(3);
    expect(sut.addOption).toHaveBeenCalledWith(
      'type',
      '-t, --type [type]',
      expect.any(String),
      'development'
    );
    expect(sut.addOption).toHaveBeenCalledWith(
      'run',
      '-r, --run',
      expect.any(String),
      false
    );
    expect(sut.addOption).toHaveBeenCalledWith(
      'watch',
      '-w, --watch',
      expect.any(String),
      false
    );
    expect(sut.hidden).toBeTrue();
    expect(sut.allowUnknownOptions).toBeTrue();
  });

  it('should return the command to build the default target', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    // When
    test.run(buildType, run, watch, null);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(0);
    expect(test.targets.getDefaultTarget).toHaveBeenCalledTimes(1);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: false,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build a node target', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: false,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build a node target that requires bundling', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.bundle = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.cleanCommand, test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build a node target that requires transpiling', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should return the command to build and run a node target', () => {
    // Given
    const buildType = 'development';
    const run = true;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.runOnDevelopment = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.buildCommand, test.runCommand],
      {
        target: test.target,
        type: buildType,
        build: false,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.buildCommand,
      test.runCommand,
    ].join(';'));
  });

  it('should return the command to build and run a node target that requires bundling', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.bundle = true;
    test.target.runOnDevelopment = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.cleanCommand, test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: true,
        run: true,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and run a node target that requires transpiling', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.target.runOnDevelopment = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        test.runCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run: true,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.runCommand,
    ].join(';'));
  });

  it('should return the command to build and watch a node target', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = true;
    const test = getTestForTheBuildCommand();
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    // expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: false,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and watch a node target that requires bundling', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.bundle = true;
    test.target.watch.development = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.cleanCommand, test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch: true,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and watch a node target that requires transpiling', () => {
    // Given
    const buildType = 'production';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.target.watch.production = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    // expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        // test.watchCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch: true,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      // test.watchCommand,
    ].join(';'));
  });

  it('should return the command to build a browser target', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.is.node = false;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.cleanCommand, test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and run a browser target', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.is.node = false;
    test.target.runOnDevelopment = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.cleanCommand, test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: true,
        run: true,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should return the command to build and `force` run a browser target', () => {
    // Given
    const buildType = 'development';
    const run = true;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.is.node = false;
    test.target.runOnDevelopment = false;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.cleanCommand, test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
    ].join(';'));
  });

  it('should never return the command to run a target with a `production` build type', () => {
    // Given
    const buildType = 'production';
    const run = true;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.target.runOnDevelopment = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run: false,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should return the command to copy the revision on with a `production` build type', () => {
    // Given
    const buildType = 'production';
    const run = true;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.revision.createRevisionOnBuild.enabled = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        test.revisionCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run: false,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.revisionCommand,
    ].join(';'));
  });

  it('should return the command to copy the revision on with a `development` build type', () => {
    // Given
    const buildType = 'production';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.revision.createRevisionOnBuild.enabled = true;
    test.projectConfiguration.version.revision.createRevisionOnBuild.onlyOnProduction = false;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        test.revisionCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.revisionCommand,
    ].join(';'));
  });

  it('should return the command to copy the revision for an specific target', () => {
    // Given
    const buildType = 'production';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.revision.createRevisionOnBuild.enabled = true;
    test.projectConfiguration.version.revision.createRevisionOnBuild.targets.push(test.targetName);
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        test.revisionCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.revisionCommand,
    ].join(';'));
  });

  it('shouldn\'t return the command to copy the revision if the target is not on the list', () => {
    // Given
    const buildType = 'production';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.version.revision.createRevisionOnBuild.enabled = true;
    test.projectConfiguration.version.revision.createRevisionOnBuild.targets.push('random-target');
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should return the command to copy the files on with a `production` build type', () => {
    // Given
    const buildType = 'production';
    const run = true;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copy.copyOnBuild.enabled = true;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        test.copyProjectFilesCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run: false,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.copyProjectFilesCommand,
    ].join(';'));
  });

  it('should return the command to copy the files on with a `development` build type', () => {
    // Given
    const buildType = 'production';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copy.copyOnBuild.enabled = true;
    test.projectConfiguration.copy.copyOnBuild.onlyOnProduction = false;
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        test.copyProjectFilesCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.copyProjectFilesCommand,
    ].join(';'));
  });

  it('should return the command to copy the files for an specific target', () => {
    // Given
    const buildType = 'production';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copy.copyOnBuild.enabled = true;
    test.projectConfiguration.copy.copyOnBuild.targets.push(test.targetName);
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
        test.copyProjectFilesCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
      test.copyProjectFilesCommand,
    ].join(';'));
  });

  it('shouldn\'t return the command to copy the files if the target is not on the list', () => {
    // Given
    const buildType = 'production';
    const run = false;
    const watch = false;
    const test = getTestForTheBuildCommand();
    test.target.transpile = true;
    test.projectConfiguration.copy.copyOnBuild.enabled = true;
    test.projectConfiguration.copy.copyOnBuild.targets.push('random-target');
    // When
    test.run(buildType, run, watch);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(1);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [
        test.cleanCommand,
        test.buildCommand,
        test.copyCommand,
        test.transpileCommand,
      ],
      {
        target: test.target,
        type: buildType,
        build: true,
        run,
        watch,
      },
      {}
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.cleanCommand,
      test.buildCommand,
      test.copyCommand,
      test.transpileCommand,
    ].join(';'));
  });

  it('should return the command to build a node target and include unknown options', () => {
    // Given
    const buildType = 'development';
    const run = false;
    const watch = false;
    const unknownOptions = {
      name: 'Rosario',
    };
    const test = getTestForTheBuildCommand();
    // When
    test.run(buildType, run, watch, test.targetName, unknownOptions);
    // Then
    expect(test.targets.getTarget).toHaveBeenCalledTimes(1);
    expect(test.targets.getTarget).toHaveBeenCalledWith(test.targetName);
    expect(test.cliCleanCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHCopyCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHNodeRunCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliSHTranspileCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliRevisionCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.cliCopyProjectFilesCommand.generate).toHaveBeenCalledTimes(0);
    expect(test.events.reduce).toHaveBeenCalledTimes(1);
    expect(test.events.reduce).toHaveBeenCalledWith(
      'build-target-commands-list',
      [test.buildCommand],
      {
        target: test.target,
        type: buildType,
        build: false,
        run,
        watch,
      },
      unknownOptions
    );
    expect(test.sut.output).toHaveBeenCalledTimes(1);
    expect(test.sut.output).toHaveBeenCalledWith([
      test.buildCommand,
    ].join(';'));
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (
          service === 'projectConfiguration' ?
            { getConfig: () => service } :
            service
        )
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cliSHBuildCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHBuildCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHBuildCommand);
    expect(sut.builder).toBe('builder');
    expect(sut.cliCleanCommand).toBe('cliCleanCommand');
    expect(sut.cliCopyProjectFilesCommand).toBe('cliCopyProjectFilesCommand');
    expect(sut.cliRevisionCommand).toBe('cliRevisionCommand');
    expect(sut.cliSHCopyCommand).toBe('cliSHCopyCommand');
    expect(sut.cliSHNodeRunCommand).toBe('cliSHNodeRunCommand');
    expect(sut.cliSHTranspileCommand).toBe('cliSHTranspileCommand');
    expect(sut.events).toBe('events');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
    expect(sut.targets).toBe('targets');
  });
});
