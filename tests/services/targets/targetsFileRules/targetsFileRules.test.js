const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/targets/targetsFileRules/targetsFileRules');

require('jasmine-expect');
const minimatch = require('minimatch');

const TargetFileRule = require('/src/services/targets/targetsFileRules/targetFileRule');
const {
  TargetsFileRules,
  targetsFileRules,
} = require('/src/services/targets/targetsFileRules/targetsFileRules');

describe('services/targets:targetsFileRules', () => {
  const testRuleProperty = (shouldMatch, pathToTest, expression, glob = null, debug = false) => {
    if (shouldMatch) {
      expect(pathToTest).toMatch(expression);
      if (glob) {
        expect(minimatch(pathToTest, glob, (debug ? { debug: true } : {}))).toBeTrue();
      }
    } else {
      expect(pathToTest).not.toMatch(expression);
      if (glob) {
        expect(minimatch(pathToTest, glob, (debug ? { debug: true } : {}))).toBeFalse();
      }
    }
  };

  beforeEach(() => {
    TargetFileRule.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    // Then
    expect(sut).toBeInstanceOf(TargetsFileRules);
    expect(sut.events).toBe(events);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.targets).toBe(targets);
  });

  it('should generate the rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const target = {
      name: 'my-target',
    };
    let sut = null;
    let result = null;
    const basicRuleTypes = [
      'js',
      'scss',
      'css',
      'images',
      'favicon',
    ];
    const expectedRuleTypes = [
      ...basicRuleTypes,
      'fonts.common',
      'fonts.svg',
    ];
    const expectedRules = {
      fonts: {
        common: expect.any(TargetFileRule),
        svg: expect.any(TargetFileRule),
      },
    };
    basicRuleTypes.forEach((ruleType) => {
      expectedRules[ruleType] = expect.any(TargetFileRule);
    });
    const expectedRuleTypeEvents = [
      'target-js-files-rule',
      'target-scss-files-rule',
      'target-css-files-rule',
      'target-common-font-files-rule',
      'target-svg-font-files-rule',
      'target-image-files-rule',
      'target-favicon-files-rule',
    ];
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    result = sut.getRulesForTarget(target);
    // Then
    expect(result).toEqual(expectedRules);
    expect(TargetFileRule).toHaveBeenCalledTimes(expectedRuleTypes.length);
    expectedRuleTypes.forEach((ruleType) => {
      expect(TargetFileRule).toHaveBeenCalledWith(events, targets, ruleType, expect.any(Function));
    });
    expect(events.emit).toHaveBeenCalledTimes(expectedRuleTypeEvents.length + 1);
    expectedRuleTypeEvents.forEach((eventName) => {
      expect(events.emit).toHaveBeenCalledWith(eventName, expect.any(TargetFileRule), target);
    });
    expect(events.emit).toHaveBeenCalledWith(
      'target-file-rules',
      {
        js: expect.any(TargetFileRule),
        scss: expect.any(TargetFileRule),
        css: expect.any(TargetFileRule),
        fonts: {
          common: expect.any(TargetFileRule),
          svg: expect.any(TargetFileRule),
        },
        images: expect.any(TargetFileRule),
        favicon: expect.any(TargetFileRule),
      },
      target
    );
  });

  it('should generate the rules for a target using its name', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const target = 'my-name';
    const targetInfo = {
      name: target,
    };
    const targets = {
      getTarget: jest.fn(() => targetInfo),
    };
    let sut = null;
    let result = null;
    const basicRuleTypes = [
      'js',
      'scss',
      'css',
      'images',
      'favicon',
    ];
    const expectedRuleTypes = [
      ...basicRuleTypes,
      'fonts.common',
      'fonts.svg',
    ];
    const expectedRules = {
      fonts: {
        common: expect.any(TargetFileRule),
        svg: expect.any(TargetFileRule),
      },
    };
    basicRuleTypes.forEach((ruleType) => {
      expectedRules[ruleType] = expect.any(TargetFileRule);
    });
    const expectedRuleTypeEvents = [
      'target-js-files-rule',
      'target-scss-files-rule',
      'target-css-files-rule',
      'target-common-font-files-rule',
      'target-svg-font-files-rule',
      'target-image-files-rule',
      'target-favicon-files-rule',
    ];
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    result = sut.getRulesForTarget(target);
    // Then
    expect(result).toEqual(expectedRules);
    expect(TargetFileRule).toHaveBeenCalledTimes(expectedRuleTypes.length);
    expectedRuleTypes.forEach((ruleType) => {
      expect(TargetFileRule).toHaveBeenCalledWith(events, targets, ruleType, expect.any(Function));
    });
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(target);
    expect(events.emit).toHaveBeenCalledTimes(expectedRuleTypeEvents.length + 1);
    expectedRuleTypeEvents.forEach((eventName) => {
      expect(events.emit).toHaveBeenCalledWith(eventName, expect.any(TargetFileRule), targetInfo);
    });
    expect(events.emit).toHaveBeenCalledWith(
      'target-file-rules',
      {
        js: expect.any(TargetFileRule),
        scss: expect.any(TargetFileRule),
        css: expect.any(TargetFileRule),
        fonts: {
          common: expect.any(TargetFileRule),
          svg: expect.any(TargetFileRule),
        },
        images: expect.any(TargetFileRule),
        favicon: expect.any(TargetFileRule),
      },
      targetInfo
    );
  });

  it('should generate the JS rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const configAbsPath = '/some-config-path';
    const pathUtils = {
      join: jest.fn(() => configAbsPath),
    };
    const targets = 'targets';
    const moduleToInclude = 'jimpex';
    const source = 'target-source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
      includeModules: [moduleToInclude],
    };
    let sut = null;
    let rule = null;
    let fn = null;
    let result = null;
    const extension = {
      regex: null,
      glob: null,
    };
    const paths = {
      config: null,
      target: null,
      module: null,
    };
    const regexs = {
      config: null,
      target: null,
      module: null,
    };
    const globs = {
      config: null,
      target: null,
      module: null,
    };
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    rule = sut.getRulesForTarget(target).js;
    [[,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target);
    extension.regex = result.extension;
    extension.glob = result.glob;
    [
      paths.config,
      paths.target,
      paths.module,
    ] = result.paths.include;
    [
      regexs.config,
      regexs.target,
      regexs.module,
    ] = result.files.include;
    [
      globs.config,
      globs.target,
      globs.module,
    ] = result.files.glob.include;
    // Then
    expect(rule.addTarget).toHaveBeenCalledTimes(1);
    expect(rule.addTarget).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
      },
      files: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
        glob: {
          include: [
            expect.any(String),
            expect.any(String),
            expect.any(String),
          ],
          exclude: [],
        },
      },
    });

    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith('config');

    // Extension
    testRuleProperty(true, 'file.js', extension.regex, extension.glob);
    testRuleProperty(true, 'file.jsx', extension.regex, extension.glob);
    testRuleProperty(false, 'file.css', extension.regex, extension.glob);

    // Paths
    // -- Config

    testRuleProperty(true, `${configAbsPath}/something`, paths.config);
    testRuleProperty(true, `${configAbsPath}/something/else`, paths.config);
    testRuleProperty(false, 'ramdom-path/to/something', paths.config);

    // -- Target
    testRuleProperty(true, `${source}/something`, paths.target);
    testRuleProperty(true, `${source}/something/else`, paths.target);
    testRuleProperty(false, 'random-path/to/something', paths.target);

    // -- Module
    testRuleProperty(true, `node_modules/${moduleToInclude}/something`, paths.module);
    testRuleProperty(true, `node_modules/${moduleToInclude}/something/else`, paths.module);
    testRuleProperty(false, 'node_modules/wootils/something/else', paths.module);

    // Files
    // -- Config
    testRuleProperty(true, `${configAbsPath}/file.js`, regexs.config, globs.config);
    testRuleProperty(true, `${configAbsPath}/other/file.js`, regexs.config, globs.config);
    testRuleProperty(false, `${configAbsPath}/other.txt`, regexs.config, globs.config);
    testRuleProperty(false, 'random-config/file.js', regexs.config, globs.config);

    // -- Target
    testRuleProperty(true, `${source}/modules/file.js`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.jsx`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/other.css`, regexs.target, globs.target);

    // --- Module
    testRuleProperty(
      true,
      `node_modules/${moduleToInclude}/file.js`,
      regexs.module,
      globs.module
    );
    testRuleProperty(
      true,
      `node_modules/${moduleToInclude}/other/file.jsx`,
      regexs.module,
      globs.module
    );
    testRuleProperty(
      false,
      'node_modules/wootils/other.js',
      regexs.module,
      globs.module
    );
    testRuleProperty(
      false,
      `node_modules/${moduleToInclude}/other.tsx`,
      regexs.module,
      globs.module
    );
  });

  it('shouldn\'t include the config path on the JS rule when adding a second target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targets = 'targets';
    const moduleToInclude = 'jimpex';
    const source = 'target-source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
      includeModules: [moduleToInclude],
    };
    let sut = null;
    let fn = null;
    let result = null;
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    sut.getRulesForTarget(target);
    [[,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target, true);
    // Then
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
      },
      files: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
        glob: {
          include: [
            expect.any(String),
            expect.any(String),
          ],
          exclude: [],
        },
      },
    });

    expect(pathUtils.join).toHaveBeenCalledTimes(0);
  });

  it('should generate the SCSS rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const moduleToInclude = 'jimpex';
    const source = 'target-source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
      includeModules: [moduleToInclude],
    };
    let sut = null;
    let rule = null;
    let fn = null;
    let result = null;
    const extension = {
      regex: null,
      glob: null,
    };
    const paths = {
      target: null,
      module: null,
    };
    const regexs = {
      target: null,
      module: null,
    };
    const globs = {
      target: null,
      module: null,
    };
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    rule = sut.getRulesForTarget(target).scss;
    [, [,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target);
    extension.regex = result.extension;
    extension.glob = result.glob;
    [
      paths.target,
      paths.module,
    ] = result.paths.include;
    [
      regexs.target,
      regexs.module,
    ] = result.files.include;
    [
      globs.target,
      globs.module,
    ] = result.files.glob.include;
    // Then
    expect(rule.addTarget).toHaveBeenCalledTimes(1);
    expect(rule.addTarget).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
      },
      files: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
        glob: {
          include: [
            expect.any(String),
            expect.any(String),
          ],
          exclude: [],
        },
      },
    });

    // Extension
    testRuleProperty(true, 'file.scss', extension.regex, extension.glob);
    testRuleProperty(false, 'file.css', extension.regex, extension.glob);

    // Paths
    // -- Target
    testRuleProperty(true, `${source}/something`, paths.target);
    testRuleProperty(true, `${source}/something/else`, paths.target);
    testRuleProperty(false, 'random-path/to/something', paths.target);

    // -- Module
    testRuleProperty(true, `node_modules/${moduleToInclude}/something`, paths.module);
    testRuleProperty(true, `node_modules/${moduleToInclude}/something/else`, paths.module);
    testRuleProperty(false, 'node_modules/wootils/something/else', paths.module);

    // Files
    // -- Target
    testRuleProperty(true, `${source}/modules/file.scss`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.scss`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/other.css`, regexs.target, globs.target);

    // --- Module
    testRuleProperty(
      true,
      `node_modules/${moduleToInclude}/file.scss`,
      regexs.module,
      globs.module
    );
    testRuleProperty(
      true,
      `node_modules/${moduleToInclude}/other/file.scss`,
      regexs.module,
      globs.module
    );
    testRuleProperty(
      false,
      'node_modules/wootils/other.scss',
      regexs.module,
      globs.module
    );
    testRuleProperty(
      false,
      `node_modules/${moduleToInclude}/other.tsx`,
      regexs.module,
      globs.module
    );
  });

  it('should generate the CSS rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const source = 'source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
    };
    let sut = null;
    let rule = null;
    let fn = null;
    let result = null;
    const extension = {
      regex: null,
      glob: null,
    };
    const paths = {
      target: null,
      modules: null,
    };
    const regexs = {
      target: null,
      modules: null,
    };
    const globs = {
      target: null,
      modules: null,
    };
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    rule = sut.getRulesForTarget(target).css;
    [,, [,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target);
    extension.regex = result.extension;
    extension.glob = result.glob;
    [
      paths.target,
      paths.modules,
    ] = result.paths.include;
    [
      regexs.target,
      regexs.modules,
    ] = result.files.include;
    [
      globs.target,
      globs.modules,
    ] = result.files.glob.include;
    // Then
    expect(rule.addTarget).toHaveBeenCalledTimes(1);
    expect(rule.addTarget).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
      },
      files: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
        glob: {
          include: [
            expect.any(String),
            expect.any(String),
          ],
          exclude: [],
        },
      },
    });

    // Extension
    testRuleProperty(true, 'file.css', extension.regex, extension.glob);
    testRuleProperty(false, 'file.scss', extension.regex, extension.glob);

    // Paths
    // -- Target
    testRuleProperty(true, `${source}/something`, paths.target);
    testRuleProperty(true, `${source}/something/else`, paths.target);
    testRuleProperty(false, 'random-path/to/something', paths.target);

    // -- Modules
    testRuleProperty(true, 'node_modules/jimpex/something', paths.modules);
    testRuleProperty(true, 'node_modules/jimpex/something/else', paths.modules);

    // Files
    // -- Target
    testRuleProperty(true, `${source}/modules/file.css`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.css`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/other.scss`, regexs.target, globs.target);
    testRuleProperty(false, 'random-path/to/something/other.css', regexs.target, globs.target);

    // --- Modules
    testRuleProperty(
      true,
      'node_modules/jimpex/file.css',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/wootils/other/file.css',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      false,
      'node_modules/jimpex/other.tsx',
      regexs.modules,
      globs.module
    );
  });

  it('should generate the common font rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const source = 'target-source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
    };
    let sut = null;
    let rule = null;
    let fn = null;
    let result = null;
    const extension = {
      regex: null,
      glob: null,
    };
    const paths = {
      target: null,
      modules: null,
    };
    const regexs = {
      target: null,
      modules: null,
    };
    const globs = {
      target: null,
      modules: null,
    };
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    rule = sut.getRulesForTarget(target).fonts.common;
    [,,, [,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target);
    extension.regex = result.extension;
    extension.glob = result.glob;
    [
      paths.target,
      paths.modules,
    ] = result.paths.include;
    [
      regexs.target,
      regexs.modules,
    ] = result.files.include;
    [
      globs.target,
      globs.modules,
    ] = result.files.glob.include;
    // Then
    expect(rule.addTarget).toHaveBeenCalledTimes(1);
    expect(rule.addTarget).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
      },
      files: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
        glob: {
          include: [
            expect.any(String),
            expect.any(String),
          ],
          exclude: [],
        },
      },
    });

    // Extension
    testRuleProperty(true, 'file.woff', extension.regex, extension.glob);
    testRuleProperty(true, 'file.woff2', extension.regex, extension.glob);
    testRuleProperty(true, 'file.ttf', extension.regex, extension.glob);
    testRuleProperty(true, 'file.eot', extension.regex, extension.glob);
    testRuleProperty(false, 'file.woff3', extension.regex, extension.glob);

    // Paths
    // -- Target
    testRuleProperty(true, `${source}/something`, paths.target);
    testRuleProperty(true, `${source}/something/else`, paths.target);
    testRuleProperty(false, 'random-path/to/something', paths.target);

    // -- Modules
    testRuleProperty(true, 'node_modules/jimpex/something', paths.modules);
    testRuleProperty(true, 'node_modules/jimpex/something/else', paths.modules);

    // Files
    // -- Target
    testRuleProperty(true, `${source}/modules/file.woff`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/file.woff2`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/file.ttf`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/file.eot`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.woff`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.woff2`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.ttf`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.eot`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/other.scss`, regexs.target, globs.target);
    testRuleProperty(false, 'random-path/to/something/other.ttf', regexs.target, globs.target);

    // -- Modules
    testRuleProperty(
      true,
      'node_modules/jimpex/file.woff',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/jimpex/file.woff2',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/wootils/other/file.ttf',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/wootils/other/file.eot',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      false,
      'node_modules/jimpex/other.tsx',
      regexs.modules,
      globs.module
    );
  });

  it('should generate the SVG font rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const source = 'target-source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
    };
    let sut = null;
    let rule = null;
    let fn = null;
    let result = null;
    const extension = {
      regex: null,
      glob: null,
    };
    const paths = {
      target: null,
      modules: null,
    };
    const regexs = {
      target: null,
      modules: null,
    };
    const globs = {
      target: null,
      modules: null,
    };
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    rule = sut.getRulesForTarget(target).fonts.svg;
    [,,,, [,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target);
    extension.regex = result.extension;
    extension.glob = result.glob;
    [
      paths.target,
      paths.modules,
    ] = result.paths.include;
    [
      regexs.target,
      regexs.modules,
    ] = result.files.include;
    [
      globs.target,
      globs.modules,
    ] = result.files.glob.include;
    // Then
    expect(rule.addTarget).toHaveBeenCalledTimes(1);
    expect(rule.addTarget).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
      },
      files: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [],
        glob: {
          include: [
            expect.any(String),
            expect.any(String),
          ],
          exclude: [],
        },
      },
    });

    // Extension
    testRuleProperty(true, 'file.svg', extension.regex, extension.glob);
    testRuleProperty(false, 'file.png', extension.regex, extension.glob);

    // Paths
    // -- Target
    testRuleProperty(true, `${source}/something/fonts/roboto`, paths.target);
    testRuleProperty(true, `${source}/fonts/roboto`, paths.target);
    testRuleProperty(true, `${source}/fonts`, paths.target);
    testRuleProperty(true, `${source}/fonts/`, paths.target);
    testRuleProperty(false, `${source}/fonts-something/`, paths.target);
    testRuleProperty(false, 'random-path/to/fonts', paths.target);

    // -- Modules
    testRuleProperty(true, 'node_modules/jimpex/something/fonts', paths.modules);
    testRuleProperty(true, 'node_modules/jimpex/fonts', paths.modules);
    testRuleProperty(true, 'node_modules/jimpex/assets/fonts/', paths.modules);
    testRuleProperty(false, 'node_modules/jimpex/fonts-something/else', paths.modules);
    testRuleProperty(false, 'node_modules/jimpex/something/else', paths.modules);

    // Files
    // -- Target
    testRuleProperty(true, `${source}/modules/fonts/file.svg`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/assets/fonts/my.svg`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/fonts/file.ttf`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/other.svg`, regexs.target, globs.target);
    testRuleProperty(false, 'random-path/to/something/other.svg', regexs.target, globs.target);

    // --- Modules
    testRuleProperty(
      true,
      'node_modules/jimpex/fonts/file.svg',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/jimpex/assets/fonts/my.svg',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      false,
      'node_modules/wootils/fonts/file.ttf',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      false,
      'node_modules/wootils/other/file.svg',
      regexs.modules,
      globs.modules
    );
  });

  it('should generate the images rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const source = 'target-source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
    };
    let sut = null;
    let rule = null;
    let fn = null;
    let result = null;
    const extension = {
      regex: null,
      glob: null,
    };
    const paths = {
      target: null,
      modules: null,
      fonts: null,
      favicon: null,
      modulesFonts: null,
    };
    const regexs = {
      target: null,
      modules: null,
      fonts: null,
      favicon: null,
      modulesFonts: null,
    };
    const globs = {
      target: null,
      modules: null,
      fonts: null,
      favicon: null,
      modulesFonts: null,
    };
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    rule = sut.getRulesForTarget(target).images;
    [,,,,, [,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target);
    extension.regex = result.extension;
    extension.glob = result.glob;
    [
      paths.target,
      paths.modules,
    ] = result.paths.include;
    [
      paths.fonts,
      paths.favicon,
      paths.modulesFonts,
    ] = result.paths.exclude;
    [
      regexs.target,
      regexs.modules,
    ] = result.files.include;
    [
      regexs.fonts,
      regexs.favicon,
      regexs.modulesFonts,
    ] = result.files.exclude;
    [
      globs.target,
      globs.modules,
    ] = result.files.glob.include;
    [
      globs.fonts,
      globs.favicon,
      globs.modulesFonts,
    ] = result.files.glob.exclude;
    // Then
    expect(rule.addTarget).toHaveBeenCalledTimes(1);
    expect(rule.addTarget).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [
          expect.any(RegExp),
          expect.any(RegExp),
          expect.any(RegExp),
        ],
      },
      files: {
        include: [
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        exclude: [
          expect.any(RegExp),
          expect.any(RegExp),
          expect.any(RegExp),
        ],
        glob: {
          include: [
            expect.any(String),
            expect.any(String),
          ],
          exclude: [
            expect.any(String),
            expect.any(String),
            expect.any(String),
          ],
        },
      },
    });

    // Extension
    testRuleProperty(true, 'file.jpg', extension.regex, extension.glob);
    testRuleProperty(true, 'file.jpeg', extension.regex, extension.glob);
    testRuleProperty(true, 'file.png', extension.regex, extension.glob);
    testRuleProperty(true, 'file.gif', extension.regex, extension.glob);
    testRuleProperty(true, 'file.svg', extension.regex, extension.glob);
    testRuleProperty(false, 'file.ttf', extension.regex, extension.glob);

    // Paths
    // -- Include
    // --- Target
    testRuleProperty(true, `${source}/something`, paths.target);
    testRuleProperty(true, `${source}/something/else`, paths.target);
    testRuleProperty(false, 'random-path/to/something', paths.target);

    // --- Modules
    testRuleProperty(true, 'node_modules/jimpex/something', paths.modules);
    testRuleProperty(true, 'node_modules/jimpex/something/else', paths.modules);
    testRuleProperty(false, 'random-path/to/something', paths.modules);

    // -- Exclude
    // --- Fonts
    testRuleProperty(true, `${source}/something/fonts/robot.svg`, paths.fonts);
    testRuleProperty(true, `${source}/something/else/fonts/my.svg`, paths.fonts);
    testRuleProperty(false, 'random-path/to/something/else.svg', paths.fonts);
    testRuleProperty(false, 'random-path/to/something', paths.fonts);

    // --- Favicon
    testRuleProperty(true, `${source}/something/fonts/favicon.png`, paths.favicon);
    testRuleProperty(true, `${source}/something/else/favicon.ico`, paths.favicon);
    testRuleProperty(false, 'random-path/to/something/favicon.gif', paths.favicon);
    testRuleProperty(false, 'random-path/to/something', paths.favicon);

    // -- Modules Fonts
    testRuleProperty(true, 'node_modules/jimpex/something/fonts/file.svg', paths.modulesFonts);
    testRuleProperty(false, 'node_modules/jimpex/file.svg', paths.modulesFonts);
    testRuleProperty(false, 'node_modules/jimpex/something/else', paths.modulesFonts);

    // Files
    // -- Include
    // --- Target
    testRuleProperty(true, `${source}/modules/file.jpg`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/file.jpeg`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/file.png`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/file.gif`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/file.svg`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.jpg`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.jpeg`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.png`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.gif`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/other/file.svg`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/other.scss`, regexs.target, globs.target);
    testRuleProperty(false, 'random-path/to/something/other.png', regexs.target, globs.target);

    // --- Modules
    testRuleProperty(
      true,
      'node_modules/jimpex/file.jpg',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/jimpex/file.jpeg',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/wootils/other/file.png',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/wootils/other/file.gif',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      true,
      'node_modules/wootils/other/file.svg',
      regexs.modules,
      globs.modules
    );
    testRuleProperty(
      false,
      'node_modules/jimpex/other.tsx',
      regexs.modules,
      globs.module
    );

    // -- Exclude
    // --- Fonts
    testRuleProperty(true, `${source}/something/fonts/robot.svg`, regexs.fonts, globs.fonts);
    testRuleProperty(true, `${source}/something/else/fonts/my.svg`, regexs.fonts, globs.fonts);
    testRuleProperty(false, 'random-path/to/something/else.svg', regexs.fonts, globs.fonts);

    // --- Favicon
    testRuleProperty(true, `${source}/something/fonts/favicon.png`, regexs.favicon, globs.favicon);
    testRuleProperty(true, `${source}/something/else/favicon.ico`, regexs.favicon, globs.favicon);
    testRuleProperty(false, 'random-path/to/something/favicon.gif', regexs.favicon, globs.favicon);
    testRuleProperty(false, 'random-path/to/something.svg', regexs.favicon, globs.favicon);

    // -- Modules Fonts
    testRuleProperty(
      true,
      'node_modules/jimpex/something/fonts/file.svg',
      regexs.modulesFonts,
      globs.modulesFonts
    );
    testRuleProperty(
      false,
      'node_modules/jimpex/file.svg',
      regexs.modulesFonts,
      globs.modulesFonts
    );
    testRuleProperty(
      false,
      'node_modules/jimpex/something/else.svg',
      regexs.modulesFonts,
      globs.modulesFonts
    );
  });

  it('should generate the favicon rules for a target', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const pathUtils = 'pathUtils';
    const targets = 'targets';
    const source = 'source';
    const target = {
      name: 'my-target',
      paths: {
        source,
      },
    };
    let sut = null;
    let rule = null;
    let fn = null;
    let result = null;
    const extension = {
      regex: null,
      glob: null,
    };
    const paths = {
      target: null,
    };
    const regexs = {
      target: null,
    };
    const globs = {
      target: null,
    };
    // When
    sut = new TargetsFileRules(events, pathUtils, targets);
    rule = sut.getRulesForTarget(target).favicon;
    [,,,,,, [,,, fn]] = TargetFileRule.mock.calls;
    result = fn(target);
    extension.regex = result.extension;
    extension.glob = result.glob;
    [paths.target] = result.paths.include;
    [regexs.target] = result.files.include;
    [globs.target] = result.files.glob.include;
    // Then
    expect(rule.addTarget).toHaveBeenCalledTimes(1);
    expect(rule.addTarget).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      extension: expect.any(RegExp),
      glob: expect.any(String),
      paths: {
        include: [
          expect.any(RegExp),
        ],
        exclude: [],
      },
      files: {
        include: [
          expect.any(RegExp),
        ],
        exclude: [],
        glob: {
          include: [
            expect.any(String),
          ],
          exclude: [],
        },
      },
    });

    // Extension
    testRuleProperty(true, 'file.png', extension.regex, extension.glob);
    testRuleProperty(true, 'file.ico', extension.regex, extension.glob);
    testRuleProperty(false, 'file.gif', extension.regex, extension.glob);

    // Paths
    // -- Target
    testRuleProperty(true, `${source}/something`, paths.target);
    testRuleProperty(true, `${source}/something/else`, paths.target);
    testRuleProperty(false, 'random-path/to/something', paths.target);

    // Files
    // -- Target
    testRuleProperty(true, `${source}/favicon.png`, regexs.target, globs.target);
    testRuleProperty(true, `${source}/modules/assets/favicon.ico`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/favicon.ttf`, regexs.target, globs.target);
    testRuleProperty(false, `${source}/modules/icon.png`, regexs.target, globs.target);
    testRuleProperty(false, 'random-path/to/something/favicon.ico', regexs.target, globs.target);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    targetsFileRules(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('targetsFileRules');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(TargetsFileRules);
    expect(sut.events).toBe('events');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.targets).toBe('targets');
  });
});
