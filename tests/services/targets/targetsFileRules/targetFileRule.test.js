jest.unmock('/src/services/targets/targetsFileRules/targetFileRule');

require('jasmine-expect');

const TargetFileRule = require('/src/services/targets/targetsFileRules/targetFileRule');

describe('services/targets:targetsFileRules', () => {
  const getEmptyRule = () => ({
    extension: /\.\w+$/i,
    glob: '**/*.css',
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
    let sut = null;
    // When
    sut = new TargetFileRule(events, 'something', () => {});
    // Then
    expect(sut).toBeInstanceOf(TargetFileRule);
    expect(sut.events).toBe(events);
  });

  it('should throw an error if instantiated without a handler function', () => {
    // Given/When/Then
    expect(() => new TargetFileRule()).toThrow(/you need to specify a handler function/i);
  });

  it('should return an empty rule if no target was added', () => {
    // Given
    const events = 'events';
    let sut = null;
    let result = null;
    // When
    sut = new TargetFileRule(events, 'something', () => {});
    result = sut.getRule();
    // Then
    expect(result).toEqual(getEmptyRule());
  });

  it('should call the handler function when a new target is added', () => {
    // Given
    const events = {
      reduce: jest.fn((eventName, rule) => rule),
    };
    const target = 'my-target';
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
    sut = new TargetFileRule(events, 'something', handler);
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
    const targetOne = 'my-target';
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
    const targetTwo = 'my-other-target';
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
      [targetOne]: targetOneRule,
      [targetTwo]: targetTwoRule,
    };
    const handler = jest.fn((targetInfo) => rulesByTarget[targetInfo]);
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
    sut = new TargetFileRule(events, 'something', handler);
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
});
