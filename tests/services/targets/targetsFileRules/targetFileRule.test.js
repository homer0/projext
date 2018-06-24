jest.unmock('/src/services/targets/targetsFileRules/targetFileRule');

require('jasmine-expect');

const TargetFileRule = require('/src/services/targets/targetsFileRules/targetFileRule');

describe('services/targets:targetsFileRules', () => {
  const getEmptyRule = () => ({
    extension: /\.\w+$/i,
    glob: '**/*.*',
    paths: {
      include: [],
      exclude: [],
    },
    files: {
      include: [],
      exclude: [],
      glob: {
        include: [],
        exclude: [],
      },
    },
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new TargetFileRule(events, targets, 'something', () => {});
    // Then
    expect(sut).toBeInstanceOf(TargetFileRule);
    expect(sut.events).toBe(events);
    expect(sut.targets).toBe(targets);
  });

  it('should throw an error if instantiated without a handler function', () => {
    // Given/When/Then
    expect(() => new TargetFileRule()).toThrow(/you need to specify a handler function/i);
  });

  it('should return an empty rule if no target was added', () => {
    // Given
    const events = 'events';
    const targets = 'targets';
    let sut = null;
    let result = null;
    // When
    sut = new TargetFileRule(events, targets, 'something', () => {});
    result = sut.getRule();
    // Then
    expect(result).toEqual(getEmptyRule());
  });

  it('should call the handler function when a new target is added', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, rule) => rule),
    };
    const targets = 'targets';
    const target = {
      name: 'my-target',
      includeTargets: [],
    };
    const targetRule = {
      extension: /\.jsx?$/i,
      glob: '**/*.{js,jsx}',
      paths: {
        include: ['include-some-regex-path'],
        exclude: ['exclude-some-regex-path'],
      },
      files: {
        include: ['include-some-regex-filepath'],
        exclude: ['exclude-some-regex-filepath'],
        glob: {
          include: ['include-some-glob-filepath'],
          exclude: ['exclude-some-glob-filepath'],
        },
      },
    };
    const handler = jest.fn(() => targetRule);
    let sut = null;
    let result = null;
    const expectedEmptyRule = getEmptyRule();
    // When
    sut = new TargetFileRule(events, targets, 'something', handler);
    sut.addTarget(target);
    result = sut.getRule();
    // Then
    expect(result).toEqual(targetRule);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(target, false, expectedEmptyRule);
    expect(events.reduce).toHaveBeenCalledTimes(1);
    expect(events.reduce).toHaveBeenCalledWith(
      ['target-file-rule'],
      targetRule,
      expectedEmptyRule
    );
  });

  it('should update the rule when multiple targets are added', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, rule) => rule),
    };
    const targets = 'targets';
    const targetOne = {
      name: 'my-target',
      includeTargets: [],
    };
    const targetOneRule = {
      extension: /\.jsx?$/i,
      glob: '**/*.{js,jsx}',
      paths: {
        include: ['target-one-include-some-regex-path'],
        exclude: ['target-one-exclude-some-regex-path'],
      },
      files: {
        include: ['target-one-include-some-regex-filepath'],
        exclude: ['target-one-exclude-some-regex-filepath'],
        glob: {
          include: ['target-one-include-some-glob-filepath'],
          exclude: ['target-one-exclude-some-glob-filepath'],
        },
      },
    };
    const targetTwo = {
      name: 'my-other-target',
      includeTargets: [],
    };
    const targetTwoRule = {
      paths: {
        include: ['target-two-include-some-regex-path'],
        exclude: ['target-two-exclude-some-regex-path'],
      },
      files: {
        include: ['target-two-include-some-regex-filepath'],
        exclude: ['target-two-exclude-some-regex-filepath'],
        glob: {
          include: ['target-two-include-some-glob-filepath'],
          exclude: ['target-two-exclude-some-glob-filepath'],
        },
      },
    };
    const rulesByTarget = {
      [targetOne.name]: targetOneRule,
      [targetTwo.name]: targetTwoRule,
    };
    const handler = jest.fn((targetInfo) => rulesByTarget[targetInfo.name]);
    let sut = null;
    let resultBeforeAddingAnything = null;
    let resultAfterAddingOneTarget = null;
    let resultAfterAddingAnotherTarget = null;
    const expectedEmptyRule = getEmptyRule();
    const expectedFinalRule = {
      extension: targetOneRule.extension,
      glob: targetOneRule.glob,
      paths: {
        include: [
          ...targetOneRule.paths.include,
          ...targetTwoRule.paths.include,
        ],
        exclude: [
          ...targetOneRule.paths.exclude,
          ...targetTwoRule.paths.exclude,
        ],
      },
      files: {
        include: [
          ...targetOneRule.files.include,
          ...targetTwoRule.files.include,
        ],
        exclude: [
          ...targetOneRule.files.exclude,
          ...targetTwoRule.files.exclude,
        ],
        glob: {
          include: [
            ...targetOneRule.files.glob.include,
            ...targetTwoRule.files.glob.include,
          ],
          exclude: [
            ...targetOneRule.files.glob.exclude,
            ...targetTwoRule.files.glob.exclude,
          ],
        },
      },
    };
    // When
    sut = new TargetFileRule(events, targets, 'something', handler);
    resultBeforeAddingAnything = sut.getRule();
    sut.addTarget(targetOne);
    resultAfterAddingOneTarget = sut.getRule();
    sut.addTarget(targetTwo);
    resultAfterAddingAnotherTarget = sut.getRule();
    // Then
    expect(resultBeforeAddingAnything).toEqual(expectedEmptyRule);
    expect(resultAfterAddingOneTarget).toEqual(targetOneRule);
    expect(resultAfterAddingAnotherTarget).toEqual(expectedFinalRule);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith(targetOne, false, expectedEmptyRule);
    expect(handler).toHaveBeenCalledWith(targetTwo, true, targetOneRule);
    expect(events.reduce).toHaveBeenCalledTimes(2);
    expect(events.reduce).toHaveBeenCalledWith(
      ['target-file-rule'],
      targetOneRule,
      expectedEmptyRule
    );
    expect(events.reduce).toHaveBeenCalledWith(
      ['target-file-rule', 'target-file-rule-update'],
      expectedFinalRule,
      targetOneRule
    );
  });

  it('should add the rules of other targets on the `includeTargets` setting', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, rule) => rule),
    };
    const targetTwoName = 'my-other-target';
    const targetOne = {
      name: 'my-target',
      includeTargets: [targetTwoName],
    };
    const targetOneRule = {
      extension: /\.jsx?$/i,
      glob: '**/*.{js,jsx}',
      paths: {
        include: ['target-one-include-some-regex-path'],
        exclude: ['target-one-exclude-some-regex-path'],
      },
      files: {
        include: ['target-one-include-some-regex-filepath'],
        exclude: ['target-one-exclude-some-regex-filepath'],
        glob: {
          include: ['target-one-include-some-glob-filepath'],
          exclude: ['target-one-exclude-some-glob-filepath'],
        },
      },
    };
    const targetTwo = {
      name: targetTwoName,
      includeTargets: [],
    };
    const targetTwoRule = {
      extension: /\.jsx?$/i,
      glob: '**/*.{js,jsx}',
      paths: {
        include: ['target-two-include-some-regex-path'],
        exclude: ['target-two-exclude-some-regex-path'],
      },
      files: {
        include: ['target-two-include-some-regex-filepath'],
        exclude: ['target-two-exclude-some-regex-filepath'],
        glob: {
          include: ['target-two-include-some-glob-filepath'],
          exclude: ['target-two-exclude-some-glob-filepath'],
        },
      },
    };
    const rulesByTarget = {
      [targetOne.name]: targetOneRule,
      [targetTwo.name]: targetTwoRule,
    };
    const targets = {
      getTarget: jest.fn(() => targetTwo),
    };
    const handler = jest.fn((targetInfo) => rulesByTarget[targetInfo.name]);
    let sut = null;
    let result = null;
    const expectedEmptyRule = getEmptyRule();
    const expectedRule = {
      extension: targetOneRule.extension,
      glob: targetOneRule.glob,
      paths: {
        include: [
          ...targetOneRule.paths.include,
          ...targetTwoRule.paths.include,
        ],
        exclude: [
          ...targetOneRule.paths.exclude,
          ...targetTwoRule.paths.exclude,
        ],
      },
      files: {
        include: [
          ...targetOneRule.files.include,
          ...targetTwoRule.files.include,
        ],
        exclude: [
          ...targetOneRule.files.exclude,
          ...targetTwoRule.files.exclude,
        ],
        glob: {
          include: [
            ...targetOneRule.files.glob.include,
            ...targetTwoRule.files.glob.include,
          ],
          exclude: [
            ...targetOneRule.files.glob.exclude,
            ...targetTwoRule.files.glob.exclude,
          ],
        },
      },
    };
    // When
    sut = new TargetFileRule(events, targets, 'something', handler);
    sut.addTarget(targetOne);
    result = sut.getRule();
    // Then
    expect(result).toEqual(expectedRule);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith(targetOne, false, expectedEmptyRule);
    expect(handler).toHaveBeenCalledWith(targetTwo, true, targetOneRule);
    expect(events.reduce).toHaveBeenCalledTimes(2);
    expect(events.reduce).toHaveBeenCalledWith(
      ['target-file-rule'],
      targetOneRule,
      expectedEmptyRule
    );
    expect(events.reduce).toHaveBeenCalledWith(
      ['target-file-rule', 'target-file-rule-update'],
      expectedRule,
      targetOneRule
    );
  });
});
