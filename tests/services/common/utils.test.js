const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/common/utils');

require('jasmine-expect');

const { Utils, utils } = require('/src/services/common/utils');

describe('services/common:utils', () => {
  describe('replacePlaceholders', () => {
    it('should replace placeholders on a string', () => {
      // Given
      const placeholders = {
        name: 'Charito',
        birthday: 'September 25, 2015',
      };
      const cases = [
        // One placeholder
        {
          original: 'Hello [name]',
          expected: `Hello ${placeholders.name}`,
        },
        // Multiple placeholders
        {
          original: '[name] was born on [birthday]',
          expected: `${placeholders.name} was born on ${placeholders.birthday}`,
        },
        // Same placeholder, multiple times
        {
          original: '[name] [name] [name]!!!',
          expected: `${placeholders.name} ${placeholders.name} ${placeholders.name}!!!`,
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => Utils.replacePlaceholders(info.original, placeholders));
      // Then
      cases.forEach((info, index) => {
        expect(results[index]).toBe(info.expected);
      });
    });

    it('should replace placeholders on a string, with custom placeholders limiters', () => {
      // Given
      const placeholders = {
        name: 'Charito',
        birthday: 'September 25, 2015',
      };
      const cases = [
        // One placeholder
        {
          original: 'Hello [name]',
          expected: `Hello ${placeholders.name}`,
          beforePlaceholder: '\\[',
          afterPlaceholder: '\\]',
        },
        // Multiple placeholders
        {
          original: '{name} was born on {birthday}',
          expected: `${placeholders.name} was born on ${placeholders.birthday}`,
          beforePlaceholder: '\\{',
          afterPlaceholder: '\\}',
        },
        // Same placeholder, multiple times
        {
          original: ':name :name :name!!!',
          expected: `${placeholders.name} ${placeholders.name} ${placeholders.name}!!!`,
          beforePlaceholder: '\\:',
          afterPlaceholder: '',
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => Utils.replacePlaceholders(
        info.original,
        placeholders,
        info.beforePlaceholder,
        info.afterPlaceholder
      ));
      // Then
      cases.forEach((info, index) => {
        expect(results[index]).toBe(info.expected);
      });
    });
  });

  describe('humanReadableList', () => {
    it('should format a list of strings into a human readable list', () => {
      // Given
      const cases = [
        {
          list: [],
          expected: '',
        },
        {
          list: ['a'],
          expected: 'a',
        },
        {
          list: ['a', 'b'],
          expected: 'a or b',
        },
        {
          list: ['a', 'b'],
          conjunction: 'and',
          expected: 'a and b',
        },
        {
          list: ['a', 'b', 'c'],
          expected: 'a, b or c',
        },
        {
          list: ['a', 'b', 'c'],
          conjunction: 'and',
          expected: 'a, b and c',
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => {
        const caseArgs = [info.list];
        if (info.conjunction) {
          caseArgs.push(info.conjunction);
        }

        return Utils.humanReadableList(...caseArgs);
      });
      // Then
      results.forEach((result, index) => {
        expect(result).toBe(cases[index].expected);
      });
    });
  });

  describe('getPropertyWithPath', () => {
    it('should read the properties of an object', () => {
      // Given
      const obj = {
        appVersion: 'alpha',
        copy: {
          enabled: false,
          items: [],
          copyOnBuild: {
            enabled: true,
            onlyOnProduction: true,
            targets: [],
          },
        },
        version: {
          defineOn: 'process.env.VERSION',
          environmentVariable: 'VERSION',
          revision: {
            enabled: false,
            copy: true,
            filename: 'revision',
            createRevisionOnBuild: {
              enabled: true,
              onlyOnProduction: true,
              targets: [],
            },
          },
        },
      };
      const cases = [
        {
          path: 'appVersion',
          expected: obj.appVersion,
        },
        {
          path: 'copy/enabled',
          expected: obj.copy.enabled,
        },
        {
          path: 'copy/copyOnBuild/onlyOnProduction',
          expected: obj.copy.copyOnBuild.onlyOnProduction,
        },
        {
          path: 'version/defineOn',
          expected: obj.version.defineOn,
        },
        {
          path: 'version,revision',
          expected: obj.version.revision,
          equal: true,
          delimiter: ',',
        },
        {
          path: 'version.revision.createRevisionOnBuild.targets',
          expected: obj.version.revision.createRevisionOnBuild.targets,
          equal: true,
          delimiter: '.',
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => {
        const caseArgs = [obj, info.path];
        if (info.delimiter) {
          caseArgs.push(info.delimiter);
        }

        return Utils.getPropertyWithPath(...caseArgs);
      });
      // Then
      results.forEach((result, index) => {
        const info = cases[index];
        if (info.equal) {
          expect(result).toEqual(info.expected);
        } else {
          expect(result).toBe(info.expected);
        }
      });
    });

    it('should throw an error if the path is invalid', () => {
      // Given
      const obj = {};
      const objPath = 'someprop';
      // When/Then
      expect(() => Utils.getPropertyWithPath(obj, objPath)).toThrow(/there's nothing/i);
    });

    it('should throw an error if part of the path is invalid', () => {
      // Given
      const obj = {
        revision: {
          enabled: false,
          copy: true,
          filename: 'revision',
          createRevisionOnBuild: {
            enabled: true,
            onlyOnProduction: true,
            targets: [],
          },
        },
      };
      const objPath = 'revision/createRevisionOnBuild/other/prop';
      const expectedInvalidPath = 'revision/createRevisionOnBuild/other';
      // When/Then
      expect(() => Utils.getPropertyWithPath(obj, objPath))
      .toThrow(new RegExp(`there's nothing on '${expectedInvalidPath}'`, 'i'));
    });
  });

  describe('deletePropertyWithPath', () => {
    it('should delete the properties of an object', () => {
      // Given
      const obj = {
        appVersion: 'alpha',
        copy: {
          enabled: false,
          items: [],
          copyOnBuild: {
            enabled: true,
            onlyOnProduction: true,
            targets: [],
          },
        },
        version: {
          defineOn: 'process.env.VERSION',
          environmentVariable: 'VERSION',
          revision: {
            enabled: false,
            copy: true,
            filename: 'revision',
            createRevisionOnBuild: {
              enabled: true,
              onlyOnProduction: true,
              targets: [],
            },
          },
        },
      };
      const cases = [
        {
          path: 'appVersion',
          expected: {
            copy: obj.copy,
            version: obj.version,
          },
        },
        {
          path: 'copy/enabled',
          expected: {
            appVersion: obj.appVersion,
            copy: {
              items: obj.copy.items,
              copyOnBuild: obj.copy.copyOnBuild,
            },
            version: obj.version,
          },
        },
        {
          path: 'copy/copyOnBuild/onlyOnProduction',
          expected: {
            appVersion: obj.appVersion,
            copy: {
              enabled: obj.copy.enabled,
              items: obj.copy.items,
              copyOnBuild: {
                enabled: obj.copy.copyOnBuild.enabled,
                targets: obj.copy.copyOnBuild.targets,
              },
            },
            version: obj.version,
          },
        },
        {
          path: 'version/defineOn',
          expected: {
            appVersion: obj.appVersion,
            copy: obj.copy,
            version: {
              environmentVariable: obj.version.environmentVariable,
              revision: obj.version.revision,
            },
          },
        },
        {
          path: 'version,revision',
          expected: {
            appVersion: obj.appVersion,
            copy: obj.copy,
            version: {
              defineOn: obj.version.defineOn,
              environmentVariable: obj.version.environmentVariable,
            },
          },
          delimiter: ',',
        },
        {
          path: 'version.revision.createRevisionOnBuild.targets',
          expected: {
            appVersion: obj.appVersion,
            copy: obj.copy,
            version: {
              defineOn: obj.version.defineOn,
              environmentVariable: obj.version.environmentVariable,
              revision: {
                enabled: obj.version.revision.enabled,
                copy: obj.version.revision.copy,
                filename: obj.version.revision.filename,
                createRevisionOnBuild: {
                  enabled: obj.version.revision.createRevisionOnBuild.enabled,
                  onlyOnProduction: obj.version.revision.createRevisionOnBuild.onlyOnProduction,
                },
              },
            },
          },
          delimiter: '.',
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => {
        const caseArgs = [obj, info.path];
        if (info.delimiter) {
          caseArgs.push(info.delimiter);
        }

        return Utils.deletePropertyWithPath(...caseArgs);
      });
      // Then
      results.forEach((result, index) => {
        expect(result).toEqual(cases[index].expected);
      });
    });

    it('should delete empty parent properties', () => {
      // Given
      const obj = {
        defineOn: 'process.env.VERSION',
        environmentVariable: 'VERSION',
        revision: {
          createRevisionOnBuild: {
            targets: {
              list: [],
            },
          },
        },
      };
      const objPath = 'revision/createRevisionOnBuild/targets/list';
      const expectedObj = {
        defineOn: obj.defineOn,
        environmentVariable: obj.environmentVariable,
      };
      let result = null;
      // When
      result = Utils.deletePropertyWithPath(obj, objPath);
      // Then
      expect(result).toEqual(expectedObj);
    });

    it('shouldn\'t delete empty parent properties', () => {
      // Given
      const obj = {
        defineOn: 'process.env.VERSION',
        environmentVariable: 'VERSION',
        revision: {
          createRevisionOnBuild: {
            targets: {
              list: [],
            },
          },
        },
      };
      const objPath = 'revision/createRevisionOnBuild/targets/list';
      const expectedObj = {
        defineOn: obj.defineOn,
        environmentVariable: obj.environmentVariable,
        revision: {
          createRevisionOnBuild: {
            targets: {},
          },
        },
      };
      let result = null;
      // When
      result = Utils.deletePropertyWithPath(obj, objPath, '/', false);
      // Then
      expect(result).toEqual(expectedObj);
    });
  });

  describe('setPropertyWithPath', () => {
    it('should insert a property on an object', () => {
      // Given
      const obj = {
        defineOn: 'process.env.VERSION',
        environmentVariable: 'VERSION',
        revision: {
          enabled: false,
          copy: true,
          filename: 'revision',
          createRevisionOnBuild: {
            enabled: true,
            onlyOnProduction: true,
            targets: [],
          },
        },
      };
      const cases = [
        {
          path: 'appVersion',
          value: 'development',
          expected: {
            appVersion: 'development',
            defineOn: obj.defineOn,
            environmentVariable: obj.environmentVariable,
            revision: obj.revision,
          },
        },
        {
          path: 'copy/enabled',
          value: true,
          expected: {
            copy: {
              enabled: true,
            },
            defineOn: obj.defineOn,
            environmentVariable: obj.environmentVariable,
            revision: obj.revision,
          },
        },
        {
          path: 'revision/createRevisionOnBuild/node',
          value: {
            version: 'current',
            npm: '> 3',
          },
          expected: {
            defineOn: obj.defineOn,
            environmentVariable: obj.environmentVariable,
            revision: {
              enabled: obj.revision.enabled,
              copy: obj.revision.copy,
              filename: obj.revision.filename,
              createRevisionOnBuild: {
                enabled: obj.revision.createRevisionOnBuild.enabled,
                onlyOnProduction: obj.revision.createRevisionOnBuild.onlyOnProduction,
                targets: obj.revision.createRevisionOnBuild.targets,
                node: {
                  version: 'current',
                  npm: '> 3',
                },
              },
            },
          },
        },
        {
          path: 'revision,enabled',
          value: false,
          expected: {
            defineOn: obj.defineOn,
            environmentVariable: obj.environmentVariable,
            revision: {
              enabled: false,
              copy: obj.revision.copy,
              filename: obj.revision.filename,
              createRevisionOnBuild: obj.revision.createRevisionOnBuild,
            },
          },
          delimiter: ',',
        },
      ];
      let results = null;
      // When
      results = cases.map((info) => {
        const caseArgs = [obj, info.path, info.value];
        if (info.delimiter) {
          caseArgs.push(info.delimiter);
        }

        return Utils.setPropertyWithPath(...caseArgs);
      });
      // Then
      results.forEach((result, index) => {
        const info = cases[index];
        expect(result).toEqual(info.expected);
      });
    });

    it('should throw an error when trying to set a value on a non object property', () => {
      // Given
      const obj = {
        defineOn: 'process.env.VERSION',
        environmentVariable: 'VERSION',
        revision: {
          enabled: false,
          copy: true,
          filename: 'revision',
          createRevisionOnBuild: {
            enabled: true,
            onlyOnProduction: true,
            targets: [],
          },
        },
      };
      const cases = [
        {
          path: 'defineOn/property',
          expected: /element of type 'string' on 'defineOn'/i,
        },
        {
          path: 'revision/createRevisionOnBuild/targets/property',
          expected: /element of type 'array' on 'revision\/createRevisionOnBuild\/targets'/i,
        },
      ];
      // When/Then
      cases.forEach((info) => {
        expect(() => Utils.setPropertyWithPath(obj, info.path, 'value'))
        .toThrow(info.expected);
      });
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    utils(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('utils');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBe(Utils);
  });
});
