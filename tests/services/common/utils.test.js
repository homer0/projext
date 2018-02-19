const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/common/utils');

require('jasmine-expect');

const { Utils, utils } = require('/src/services/common/utils');

describe('services/common:utils', () => {
  it('should replace placeholders on a string', () => {
    // Given
    const placeholders = {
      name: 'Charito',
      birthday: 'September 25, 2015',
    };
    const strings = [
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
    results = strings.map((info) => Utils.replacePlaceholders(info.original, placeholders));
    // Then
    strings.forEach((info, index) => {
      expect(results[index]).toBe(info.expected);
    });
  });

  it('should replace placeholders on a string, with custom placeholders limiters', () => {
    // Given
    const placeholders = {
      name: 'Charito',
      birthday: 'September 25, 2015',
    };
    const strings = [
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
    results = strings.map((info) => Utils.replacePlaceholders(
      info.original,
      placeholders,
      info.beforePlaceholder,
      info.afterPlaceholder
    ));
    // Then
    strings.forEach((info, index) => {
      expect(results[index]).toBe(info.expected);
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
