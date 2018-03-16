const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/common/tempFiles');

require('jasmine-expect');
const fs = require('fs-extra');
const {
  TempFiles,
  tempFiles,
} = require('/src/services/common/tempFiles');

describe('services/common:tempFiles', () => {
  beforeEach(() => {
    fs.ensureDir.mockReset();
    fs.readFile.mockReset();
    fs.writeFile.mockReset();
    fs.unlink.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const info = {
      name: 'projext',
    };
    const pathUtils = {
      addLocation: jest.fn(),
    };
    let sut = null;
    // When
    sut = new TempFiles(info, pathUtils);
    // Then
    expect(sut).toBeInstanceOf(TempFiles);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(pathUtils.addLocation).toHaveBeenCalledTimes(1);
    expect(pathUtils.addLocation).toHaveBeenCalledWith(
      'temp',
      `node_modules/${info.name}/.tmp`
    );
  });

  it('should be instantiated with a custom directory and location name', () => {
    // Given
    const info = {
      name: 'projext',
    };
    const pathUtils = {
      addLocation: jest.fn(),
    };
    const directory = '.my-files';
    const location = 'myFiles';
    let sut = null;
    // When
    sut = new TempFiles(info, pathUtils, directory, location);
    // Then
    expect(sut).toBeInstanceOf(TempFiles);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(pathUtils.addLocation).toHaveBeenCalledTimes(1);
    expect(pathUtils.addLocation).toHaveBeenCalledWith(
      location,
      `node_modules/${info.name}/${directory}`
    );
  });

  it('should read a file', () => {
    // Given
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    const filepath = 'file.tmp';
    const contents = 'Hello Charito!';
    fs.readFile.mockImplementationOnce(() => Promise.resolve(contents));
    const info = {
      name: 'projext',
    };
    const pathUtils = {
      addLocation: () => {},
      getLocation: jest.fn((name) => name),
      joinFrom: jest.fn((from, rest) => rest),
    };
    let sut = null;
    // When
    sut = new TempFiles(info, pathUtils);
    return sut.read(filepath)
    .then((result) => {
      // Then
      expect(result).toBe(contents);
      expect(pathUtils.getLocation).toHaveBeenCalledTimes(1);
      expect(pathUtils.getLocation).toHaveBeenCalledWith(sut.locationName);
      expect(pathUtils.joinFrom).toHaveBeenCalledTimes(1);
      expect(pathUtils.joinFrom).toHaveBeenCalledWith(sut.locationName, filepath);
      expect(fs.ensureDir).toHaveBeenCalledTimes(1);
      expect(fs.ensureDir).toHaveBeenCalledWith(sut.locationName);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledWith(filepath, 'utf-8');
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should read a file with custom encoding', () => {
    // Given
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    const filepath = 'file.tmp';
    const contents = 'Hello Charito!';
    const encoding = 'utf-12';
    fs.readFile.mockImplementationOnce(() => Promise.resolve(contents));
    const info = {
      name: 'projext',
    };
    const pathUtils = {
      addLocation: () => {},
      getLocation: jest.fn((name) => name),
      joinFrom: jest.fn((from, rest) => rest),
    };
    let sut = null;
    // When
    sut = new TempFiles(info, pathUtils);
    return sut.read(filepath, encoding)
    .then((result) => {
      // Then
      expect(result).toBe(contents);
      expect(pathUtils.getLocation).toHaveBeenCalledTimes(1);
      expect(pathUtils.getLocation).toHaveBeenCalledWith(sut.locationName);
      expect(pathUtils.joinFrom).toHaveBeenCalledTimes(1);
      expect(pathUtils.joinFrom).toHaveBeenCalledWith(sut.locationName, filepath);
      expect(fs.ensureDir).toHaveBeenCalledTimes(1);
      expect(fs.ensureDir).toHaveBeenCalledWith(sut.locationName);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledWith(filepath, encoding);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should write on a file', () => {
    // Given
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    const filepath = 'file.tmp';
    const contents = 'Charito!';
    fs.writeFile.mockImplementationOnce(() => Promise.resolve());
    const info = {
      name: 'projext',
    };
    const pathUtils = {
      addLocation: () => {},
      getLocation: jest.fn((name) => name),
      joinFrom: jest.fn((from, rest) => rest),
    };
    let sut = null;
    // When
    sut = new TempFiles(info, pathUtils);
    return sut.write(filepath, contents)
    .then((result) => {
      // Then
      expect(result).toBe(filepath);
      expect(pathUtils.getLocation).toHaveBeenCalledTimes(1);
      expect(pathUtils.getLocation).toHaveBeenCalledWith(sut.locationName);
      expect(pathUtils.joinFrom).toHaveBeenCalledTimes(1);
      expect(pathUtils.joinFrom).toHaveBeenCalledWith(sut.locationName, filepath);
      expect(fs.ensureDir).toHaveBeenCalledTimes(1);
      expect(fs.ensureDir).toHaveBeenCalledWith(sut.locationName);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledWith(filepath, contents);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should delete a file', () => {
    // Given
    fs.ensureDir.mockImplementationOnce(() => Promise.resolve());
    const filepath = 'file.tmp';
    fs.unlink.mockImplementationOnce(() => Promise.resolve());
    const info = {
      name: 'projext',
    };
    const pathUtils = {
      addLocation: () => {},
      getLocation: jest.fn((name) => name),
      joinFrom: jest.fn((from, rest) => rest),
    };
    let sut = null;
    // When
    sut = new TempFiles(info, pathUtils);
    return sut.delete(filepath)
    .then((result) => {
      // Then
      expect(result).toBe(filepath);
      expect(pathUtils.getLocation).toHaveBeenCalledTimes(1);
      expect(pathUtils.getLocation).toHaveBeenCalledWith(sut.locationName);
      expect(pathUtils.joinFrom).toHaveBeenCalledTimes(1);
      expect(pathUtils.joinFrom).toHaveBeenCalledWith(sut.locationName, filepath);
      expect(fs.ensureDir).toHaveBeenCalledTimes(1);
      expect(fs.ensureDir).toHaveBeenCalledWith(sut.locationName);
      expect(fs.unlink).toHaveBeenCalledTimes(1);
      expect(fs.unlink).toHaveBeenCalledWith(filepath);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    const info = {
      name: 'projext',
    };
    const pathUtils = {
      addLocation: jest.fn(),
    };
    const services = {
      info,
      pathUtils,
    };
    const app = {
      set: jest.fn(),
      get: jest.fn((service) => services[service]),
    };
    let sut = null;
    let serviceName = null;
    let serviceFn = null;
    // When
    tempFiles(app);
    [[serviceName, serviceFn]] = app.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('tempFiles');
    expect(sut).toBeInstanceOf(TempFiles);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(pathUtils.addLocation).toHaveBeenCalledTimes(1);
    expect(pathUtils.addLocation).toHaveBeenCalledWith(
      'temp',
      `node_modules/${info.name}/.tmp`
    );
  });
});
