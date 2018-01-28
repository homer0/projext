const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/buildVersion');

require('jasmine-expect');
const {
  BuildVersion,
  buildVersion,
} = require('/src/services/building/buildVersion');

describe('services/building:buildVersion', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const projectConfiguration = 'projectConfiguration';
    const versionUtils = 'versionUtils';
    let sut = null;
    // When
    sut = new BuildVersion(
      events,
      projectConfiguration,
      versionUtils
    );
    // Then
    expect(sut).toBeInstanceOf(BuildVersion);
    expect(sut.events).toBe(events);
    expect(sut.projectConfiguration).toBe(projectConfiguration);
    expect(sut.versionUtils).toBe(versionUtils);
  });

  it('should try to obtain the project version using the configuration settings values', () => {
    // Given
    const events = 'events';
    const environmentVariable = 'VERSION';
    const filename = 'revisionFile';
    const projectConfiguration = {
      version: {
        environmentVariable,
        revision: {
          filename,
        },
      },
    };
    const version = 'latest';
    const versionUtils = {
      getVersion: jest.fn(() => version),
    };
    let sut = null;
    let result = null;
    // When
    sut = new BuildVersion(
      events,
      projectConfiguration,
      versionUtils
    );
    result = sut.getVersion();
    // Then
    expect(result).toBe(version);
    expect(versionUtils.getVersion).toHaveBeenCalledTimes(1);
    expect(versionUtils.getVersion).toHaveBeenCalledWith(filename, environmentVariable);
  });

  it('should create a revision file', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const environmentVariable = 'VERSION';
    const filename = 'revisionFile';
    const projectConfiguration = {
      version: {
        environmentVariable,
        revision: {
          enabled: true,
          filename,
        },
      },
    };
    const version = 'latest';
    const versionUtils = {
      createRevisionFile: jest.fn(() => Promise.resolve(version)),
    };
    let sut = null;
    // When
    sut = new BuildVersion(
      events,
      projectConfiguration,
      versionUtils
    );
    return sut.createRevision()
    .then((result) => {
      // Then
      expect(result).toBe(version);
      expect(versionUtils.createRevisionFile).toHaveBeenCalledTimes(1);
      expect(versionUtils.createRevisionFile).toHaveBeenCalledWith(filename, environmentVariable);
      expect(events.emit).toHaveBeenCalledTimes(1);
      expect(events.emit).toHaveBeenCalledWith(
        'revision-file-created',
        version
      );
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should create a revision file with a `force` flag even if the feature is disabled', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const environmentVariable = 'VERSION';
    const filename = 'revisionFile';
    const projectConfiguration = {
      version: {
        environmentVariable,
        revision: {
          enabled: false,
          filename,
        },
      },
    };
    const version = 'latest';
    const versionUtils = {
      createRevisionFile: jest.fn(() => Promise.resolve(version)),
    };
    let sut = null;
    // When
    sut = new BuildVersion(
      events,
      projectConfiguration,
      versionUtils
    );
    return sut.createRevision(true)
    .then((result) => {
      // Then
      expect(result).toBe(version);
      expect(versionUtils.createRevisionFile).toHaveBeenCalledTimes(1);
      expect(versionUtils.createRevisionFile).toHaveBeenCalledWith(filename, environmentVariable);
      expect(events.emit).toHaveBeenCalledTimes(1);
      expect(events.emit).toHaveBeenCalledWith(
        'revision-file-created',
        version
      );
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should fail to create a revision file because the feature is disabled', () => {
    // Given
    const events = {
      emit: jest.fn(),
    };
    const projectConfiguration = {
      version: {
        revision: {
          enabled: false,
        },
      },
    };
    const versionUtils = {
      createRevisionFile: jest.fn(),
    };
    let sut = null;
    // When
    sut = new BuildVersion(
      events,
      projectConfiguration,
      versionUtils
    );
    return sut.createRevision()
    .then(() => {
      expect(true).toBeFalse();
    })
    .catch((error) => {
      // Then
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/The revision feature is disabled/i);
      expect(events.emit).toHaveBeenCalledTimes(0);
      expect(versionUtils.createRevisionFile).toHaveBeenCalledTimes(0);
    });
  });

  it('should return the name of the variable where the version will be defined', () => {
    // Given
    const events = 'events';
    const defineOn = 'process.env.VERSION';
    const projectConfiguration = {
      version: {
        defineOn,
      },
    };
    const versionUtils = 'versionUtils';
    let sut = null;
    let result = null;
    // When
    sut = new BuildVersion(
      events,
      projectConfiguration,
      versionUtils
    );
    result = sut.getDefinitionVariable();
    // Then
    expect(result).toBe(defineOn);
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
    buildVersion(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildVersion');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildVersion);
    expect(sut.events).toBe('events');
    expect(sut.projectConfiguration).toBe('projectConfiguration');
    expect(sut.versionUtils).toBe('versionUtils');
  });
});
