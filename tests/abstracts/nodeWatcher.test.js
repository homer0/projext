jest.mock('watchpack');
jest.unmock('/src/abstracts/nodeWatcher');

require('jasmine-expect');
const Watchpack = require('watchpack');
const NodeWatcher = require('/src/abstracts/nodeWatcher');

describe('abstracts:NodeWatcher', () => {
  beforeEach(() => {
    Watchpack.mockReset();
  });

  it('should throw an error if used without subclassing it', () => {
    // Given/When/Then
    expect(() => new NodeWatcher())
    .toThrow(/NodeWatcher is an abstract class/i);
  });

  it('should throw an error if `watch` is called when the service is already watching', () => {
    // Given
    class Sut extends NodeWatcher {
      constructor() {
        super();
        this.watching = true;
      }
    }
    let sut = null;
    // When/Then
    sut = new Sut();
    expect(() => sut.watch()).toThrow(/The service is already watching/i);
  });

  it('should throw an error if `watch` is called without a list of paths', () => {
    // Given
    class Sut extends NodeWatcher {}
    let sut = null;
    // When/Then
    sut = new Sut();
    expect(() => sut.watch([]))
    .toThrow(/You need to specify at least one path to watch/i);
  });

  it('should throw an error if `watch` is called without transpilation and copy paths', () => {
    // Given
    class Sut extends NodeWatcher {}
    let sut = null;
    // When/Then
    sut = new Sut();
    expect(() => sut.watch(['random']))
    .toThrow(/You need to provide at least one transpilation or copy path/i);
  });

  it('should start watching a list of paths', () => {
    // Given
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn();
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
    }));
    const onStart = jest.fn();
    class Sut extends NodeWatcher {
      _onStart() {
        onStart();
      }
    }
    const watchpackSettings = {
      hello: 'Charito!',
    };
    const watchPaths = ['some/random/path'];
    let sut = null;
    // When
    sut = new Sut(watchpackSettings);
    sut.watch(watchPaths, ['random']);
    // Then
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(Watchpack).toHaveBeenCalledTimes(1);
    expect(Watchpack).toHaveBeenCalledWith(watchpackSettings);
    expect(watchpackWatch).toHaveBeenCalledTimes(1);
    expect(watchpackWatch).toHaveBeenCalledWith([], watchPaths);
    expect(watchpackOn).toHaveBeenCalledTimes(1);
    expect(watchpackOn).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should start and stop watching a list of paths', () => {
    // Given
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn();
    const watchpackClose = jest.fn();
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
      close: watchpackClose,
    }));
    const onStart = jest.fn();
    class Sut extends NodeWatcher {
      _onStart() {
        onStart();
      }
    }
    const watchpackSettings = {
      hello: 'Charito!',
    };
    const watchPaths = ['some/random/path'];
    let sut = null;
    // When
    sut = new Sut(watchpackSettings);
    sut.watch(watchPaths, ['random']);
    sut.stop();
    // Then
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(Watchpack).toHaveBeenCalledTimes(1);
    expect(Watchpack).toHaveBeenCalledWith(watchpackSettings);
    expect(watchpackWatch).toHaveBeenCalledTimes(1);
    expect(watchpackWatch).toHaveBeenCalledWith([], watchPaths);
    expect(watchpackOn).toHaveBeenCalledTimes(1);
    expect(watchpackOn).toHaveBeenCalledWith('change', expect.any(Function));
    expect(watchpackClose).toHaveBeenCalledTimes(1);
  });

  it('shouldnt do anything when `stop` is called by the service is not watching', () => {
    // Given
    const watchpackClose = jest.fn();
    Watchpack.mockImplementationOnce(() => ({
      close: watchpackClose,
    }));
    class Sut extends NodeWatcher {}
    let sut = null;
    // When
    sut = new Sut();
    sut.stop();
    // Then
    expect(Watchpack).toHaveBeenCalledTimes(0);
    expect(watchpackClose).toHaveBeenCalledTimes(0);
  });

  it('should return the list of watched directories', () => {
    // Given
    Watchpack.mockImplementationOnce(() => ({
      watch: jest.fn(),
      on: jest.fn(),
    }));
    class Sut extends NodeWatcher {}
    const watchPaths = ['some/random/path'];
    let sut = null;
    let result = null;
    // When
    sut = new Sut();
    sut.watch(watchPaths, ['random']);
    result = sut.getPaths();
    // Then
    expect(result).toEqual(watchPaths);
  });

  it('should call `_onInvalidPathForChange` when a file path is not recognized', () => {
    // Given
    let onChange;
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn((eventName, fn) => {
      onChange = fn;
    });
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
    }));
    const onInvalidPathForChange = jest.fn();
    class Sut extends NodeWatcher {
      _onInvalidPathForChange(...args) {
        onInvalidPathForChange(...args);
      }
    }
    const watchPaths = ['some/random/path'];
    const transpilationAndCopyPaths = [{
      from: 'some/random/path',
      to: 'some/random/path',
    }];
    const changedFile = 'some/file.js';
    let sut = null;
    // When
    sut = new Sut();
    sut.watch(watchPaths, transpilationAndCopyPaths, transpilationAndCopyPaths);
    onChange(changedFile);
    // Then
    expect(onInvalidPathForChange).toHaveBeenCalledTimes(1);
    expect(onInvalidPathForChange).toHaveBeenCalledWith(changedFile);
  });

  it('shouldn\'t do anything if `_onInvalidPathForChange` is not overwritten', () => {
    // Given
    let onChange;
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn((eventName, fn) => {
      onChange = fn;
    });
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
    }));
    class Sut extends NodeWatcher {}
    const watchPaths = ['some/random/path'];
    const transpilationAndCopyPaths = [{
      from: 'some/random/path',
      to: 'some/random/path',
    }];
    const changedFile = 'some/file.js';
    let sut = null;
    // When/Then
    sut = new Sut();
    sut.watch(watchPaths, transpilationAndCopyPaths, transpilationAndCopyPaths);
    onChange(changedFile);
  });

  it('should call throw an error if `_transpileFile` is not overwritten', () => {
    // Given
    let onChange;
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn((eventName, fn) => {
      onChange = fn;
    });
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
    }));
    class Sut extends NodeWatcher {}
    const watchPaths = ['some/random/path'];
    const transpilationPath = {
      from: 'some/source/path',
      to: 'some/output/path',
    };
    const fileBasePath = '/some/inner/path.js';
    const changedFile = `${transpilationPath.from}${fileBasePath}`;
    const copyPaths = [{
      from: 'some/random/path',
      to: 'some/random/path',
    }];
    let sut = null;
    // When/Then
    sut = new Sut();
    sut.watch(watchPaths, [transpilationPath], copyPaths);
    expect(() => onChange(changedFile))
    .toThrow(/_transpileFile must be overwritten/i);
  });

  it('should provide the old and new path when `_transpileFile` is overwritten', () => {
    // Given
    let onChange;
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn((eventName, fn) => {
      onChange = fn;
    });
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
    }));
    const transpileFile = jest.fn();
    class Sut extends NodeWatcher {
      _transpileFile(...args) {
        transpileFile(...args);
      }
    }
    const watchPaths = ['some/random/path'];
    const transpilationPath = {
      from: 'some/source/path',
      to: 'some/output/path',
    };
    const fileBasePath = '/some/inner/path.js';
    const changedFile = `${transpilationPath.from}${fileBasePath}`;
    const copyPaths = [{
      from: 'some/random/path',
      to: 'some/random/path',
    }];
    let sut = null;
    // When
    sut = new Sut();
    sut.watch(watchPaths, [transpilationPath], copyPaths);
    onChange(changedFile);
    // Then
    expect(transpileFile).toHaveBeenCalledTimes(1);
    expect(transpileFile).toHaveBeenCalledWith(
      changedFile,
      `${transpilationPath.to}${fileBasePath}`
    );
  });

  it('should call throw an error if `_copyFile` is not overwritten', () => {
    // Given
    let onChange;
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn((eventName, fn) => {
      onChange = fn;
    });
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
    }));
    class Sut extends NodeWatcher {}
    const watchPaths = ['some/random/path'];
    const transpilationPaths = [{
      from: 'some/random/path',
      to: 'some/random/path',
    }];
    const copyPath = {
      from: 'some/source/path',
      to: 'some/output/path',
    };
    const fileBasePath = '/some/inner/path.js';
    const changedFile = `${copyPath.from}${fileBasePath}`;
    let sut = null;
    // When/Then
    sut = new Sut();
    sut.watch(watchPaths, transpilationPaths, [copyPath]);
    expect(() => onChange(changedFile))
    .toThrow(/_copyFile must be overwritten/i);
  });

  it('should provide the old and new path when `_copyFile` is overwritten', () => {
    // Given
    let onChange;
    const watchpackWatch = jest.fn();
    const watchpackOn = jest.fn((eventName, fn) => {
      onChange = fn;
    });
    Watchpack.mockImplementationOnce(() => ({
      watch: watchpackWatch,
      on: watchpackOn,
    }));
    const copyFile = jest.fn();
    class Sut extends NodeWatcher {
      _copyFile(...args) {
        copyFile(...args);
      }
    }
    const watchPaths = ['some/random/path'];
    const transpilationPaths = [{
      from: 'some/random/path',
      to: 'some/random/path',
    }];
    const copyPath = {
      from: 'some/source/path',
      to: 'some/output/path',
    };
    const fileBasePath = '/some/inner/path.js';
    const changedFile = `${copyPath.from}${fileBasePath}`;
    let sut = null;
    // When/Then
    sut = new Sut();
    sut.watch(watchPaths, transpilationPaths, [copyPath]);
    onChange(changedFile);
    // Then
    expect(copyFile).toHaveBeenCalledTimes(1);
    expect(copyFile).toHaveBeenCalledWith(
      changedFile,
      `${copyPath.to}${fileBasePath}`
    );
  });
});
