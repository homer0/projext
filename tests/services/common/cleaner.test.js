const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('del');
jest.unmock('/src/services/common/cleaner');

require('jasmine-expect');

const del = require('del');
const { Cleaner, cleaner } = require('/src/services/common/cleaner');

describe('services/common:cleaner', () => {
  beforeEach(() => {
    del.mockClear();
  });

  it('should remove a file from a directory', () => {
    // Given
    const directory = 'some-directory';
    const file = 'fileA.js';
    const expectedFiles = [`${directory}/${file}`];
    // When
    Cleaner.clean(directory, file);
    // Then
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(expectedFiles);
  });

  it('should remove a list of files from a directory', () => {
    // Given
    const directory = 'some-directory';
    const files = ['fileA.js', 'fileB.js'];
    const expectedFiles = files.map((file) => `${directory}/${file}`);
    // When
    Cleaner.clean(directory, files);
    // Then
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(expectedFiles);
  });

  it('should remove all the files on a directory except for a given list', () => {
    // Given
    const directory = 'some-directory';
    const files = ['fileA.js', 'fileB.js'];
    const removeOthers = true;
    const expectedFiles = [
      `${directory}/**`,
      `!${directory}`,
      ...files.map((file) => `!${directory}/${file}`),
    ];
    // When
    Cleaner.clean(directory, files, removeOthers);
    // Then
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith(expectedFiles);
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    cleaner(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('cleaner');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBe(Cleaner.clean);
  });
});
