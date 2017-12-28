const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/common/copier');

require('jasmine-expect');

const fs = require('fs-extra');
const { Copier, copier } = require('/src/services/common/copier');

describe('services/common:copier', () => {
  beforeEach(() => {
    fs.copy.mockReset();
    fs.pathExists.mockReset();
    fs.ensureDir.mockReset();
    fs.readdir.mockReset();
  });

  it('should copy an item from one folder to another', () => {
    // Given
    const origin = 'origin-folder';
    const target = 'target-folder';
    const item = 'fileA.js';
    const expectedOriginPath = `${origin}/${item}`;
    const expectedTargetPath = `${target}/${item}`;
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.copy.mockImplementationOnce(() => Promise.resolve());
    // When
    return Copier.copy(origin, target, [item])
    .then((result) => {
      // Then
      expect(fs.pathExists).toHaveBeenCalledTimes(1);
      expect(fs.pathExists).toHaveBeenCalledWith(expectedOriginPath);
      expect(fs.copy).toHaveBeenCalledTimes(1);
      expect(fs.copy).toHaveBeenCalledWith(expectedOriginPath, expectedTargetPath);
      expect(result).toEqual([{
        from: expectedOriginPath,
        to: expectedTargetPath,
        success: true,
      }]);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should copy a list of items from one folder to another', () => {
    // Given
    const origin = 'origin-folder';
    const target = 'target-folder';
    const file = 'fileA.js';
    const folder = 'folderB';
    const items = [file, folder];
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.copy.mockImplementationOnce(() => Promise.resolve());
    fs.copy.mockImplementationOnce(() => Promise.resolve());
    let expectedOriginPath = null;
    let expectedTargetPath = null;
    // When
    return Copier.copy(origin, target, items)
    .then((result) => {
      // Then
      expect(fs.pathExists).toHaveBeenCalledTimes(items.length);
      expect(fs.copy).toHaveBeenCalledTimes(items.length);
      expect(result).toBeArray();
      items.forEach((item, index) => {
        expectedOriginPath = `${origin}/${item}`;
        expectedTargetPath = `${target}/${item}`;
        expect(fs.pathExists).toHaveBeenCalledWith(expectedOriginPath);
        expect(fs.copy).toHaveBeenCalledWith(expectedOriginPath, expectedTargetPath);
        expect(result[index]).toEqual({
          from: expectedOriginPath,
          to: expectedTargetPath,
          success: true,
        });
      });
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should copy a list of items that includes a node module', () => {
    // Given
    const origin = 'origin-folder';
    const target = 'target-folder';
    const file = 'fileA.js';
    const folder = 'node_modules/moduleB';
    const folderItems = [
      'node_modules',
      'package-lock.json',
      'package.json',
    ];
    const items = [file, folder];
    const expectedCopies = [file, `${folder}/package.json`];
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.copy.mockImplementationOnce(() => Promise.resolve());
    fs.copy.mockImplementationOnce(() => Promise.resolve());
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.readdir.mockImplementationOnce(() => Promise.resolve(folderItems));
    let expectedOriginPath = null;
    let expectedTargetPath = null;
    // When
    return Copier.copy(origin, target, items)
    .then((result) => {
      // Then
      expect(fs.pathExists).toHaveBeenCalledTimes(items.length);
      expect(fs.copy).toHaveBeenCalledTimes(expectedCopies.length);
      expect(fs.ensureDir).toHaveBeenCalledTimes(1);
      expect(fs.ensureDir).toHaveBeenCalledWith(`${target}/${folder}`);
      expect(result).toBeArray();
      expectedCopies.forEach((item) => {
        expectedOriginPath = `${origin}/${item}`;
        expectedTargetPath = `${target}/${item}`;
        expect(fs.copy).toHaveBeenCalledWith(expectedOriginPath, expectedTargetPath);
      });
      items.forEach((item, index) => {
        expectedOriginPath = `${origin}/${item}`;
        expectedTargetPath = `${target}/${item}`;
        expect(fs.pathExists).toHaveBeenCalledWith(expectedOriginPath);
        expect(result[index]).toEqual({
          from: expectedOriginPath,
          to: expectedTargetPath,
          success: true,
        });
      });
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to copy a list of items that includes a node module', () => {
    // Given
    const origin = 'origin-folder';
    const target = 'target-folder';
    const folder = 'node_modules/moduleB';
    const folderItems = [
      'node_modules',
      'package-lock.json',
      'package.json',
    ];
    const items = [folder];
    const expectedCopies = [`${folder}/package.json`];
    const error = 'Some Error';
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.copy.mockImplementationOnce(() => Promise.reject(error));
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    fs.readdir.mockImplementationOnce(() => Promise.resolve(folderItems));
    let expectedOriginPath = null;
    let expectedTargetPath = null;
    // When
    return Copier.copy(origin, target, items)
    .then((result) => {
      // Then
      expect(fs.pathExists).toHaveBeenCalledTimes(items.length);
      expect(fs.copy).toHaveBeenCalledTimes(expectedCopies.length);
      expect(fs.ensureDir).toHaveBeenCalledTimes(1);
      expect(fs.ensureDir).toHaveBeenCalledWith(`${target}/${folder}`);
      expect(result).toBeArray();
      expectedCopies.forEach((item) => {
        expectedOriginPath = `${origin}/${item}`;
        expectedTargetPath = `${target}/${item}`;
        expect(fs.copy).toHaveBeenCalledWith(expectedOriginPath, expectedTargetPath);
      });
      items.forEach((item, index) => {
        expectedOriginPath = `${origin}/${item}`;
        expectedTargetPath = `${target}/${item}`;
        expect(fs.pathExists).toHaveBeenCalledWith(expectedOriginPath);
        expect(result[index]).toEqual({
          from: expectedOriginPath,
          to: expectedTargetPath,
          success: false,
          error,
        });
      });
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to copy a list of items from one folder to another', () => {
    // Given
    const origin = 'origin-folder';
    const target = 'target-folder';
    const item = 'fileA.js';
    const error = 'Some Error';
    const expectedOriginPath = `${origin}/${item}`;
    const expectedTargetPath = `${target}/${item}`;
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.copy.mockImplementationOnce(() => Promise.reject(error));
    // When
    return Copier.copy(origin, target, [item])
    .then((result) => {
      // Then
      expect(fs.pathExists).toHaveBeenCalledTimes(1);
      expect(fs.pathExists).toHaveBeenCalledWith(expectedOriginPath);
      expect(fs.copy).toHaveBeenCalledTimes(1);
      expect(fs.copy).toHaveBeenCalledWith(expectedOriginPath, expectedTargetPath);
      expect(result).toEqual([{
        from: expectedOriginPath,
        to: expectedTargetPath,
        success: false,
        error,
      }]);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to copy a list of items because one doesn\'t exist', () => {
    // Given
    const origin = 'origin-folder';
    const target = 'target-folder';
    const item = 'fileA.js';
    const expectedOriginPath = `${origin}/${item}`;
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(false));
    // When
    return Copier.copy(origin, target, [item])
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((error) => {
      // Then
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/it doesn't exist/);
      expect(fs.pathExists).toHaveBeenCalledTimes(1);
      expect(fs.pathExists).toHaveBeenCalledWith(expectedOriginPath);
    });
  });

  it('should be able to receive a different name for files when copying', () => {
    // Given
    const origin = 'origin-folder';
    const target = 'target-folder';
    const originalName = 'fileA.js';
    const newName = 'fileB.js';
    const items = [{
      [originalName]: newName,
    }];
    const expectedOriginPath = `${origin}/${originalName}`;
    const expectedTargetPath = `${target}/${newName}`;
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    fs.copy.mockImplementationOnce(() => Promise.resolve());
    // When
    return Copier.copy(origin, target, items)
    .then((result) => {
      // Then
      expect(fs.pathExists).toHaveBeenCalledTimes(1);
      expect(fs.pathExists).toHaveBeenCalledWith(expectedOriginPath);
      expect(fs.copy).toHaveBeenCalledTimes(1);
      expect(fs.copy).toHaveBeenCalledWith(expectedOriginPath, expectedTargetPath);
      expect(result).toEqual([{
        from: expectedOriginPath,
        to: expectedTargetPath,
        success: true,
      }]);
    })
    .catch(() => {
      expect(true).toBeFalse();
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
    copier(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('copier');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBeFunction();
  });
});
