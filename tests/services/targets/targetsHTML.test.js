const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/targets/targetsHTML');

require('jasmine-expect');

const fs = require('fs-extra');
const {
  TargetsHTML,
  targetsHTML,
} = require('/src/services/targets/targetsHTML');

describe('services/targets:targetsHTML', () => {
  beforeEach(() => {
    fs.pathExists.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const events = 'events';
    const tempFiles = 'tempFiles';
    let sut = null;
    // When
    sut = new TargetsHTML(events, tempFiles);
    // Then
    expect(sut).toBeInstanceOf(TargetsHTML);
    expect(sut.events).toBe(events);
    expect(sut.tempFiles).toBe(tempFiles);
  });

  it('should generate a default HTML file for the target and return its path', () => {
    // Given
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(false));
    const events = {
      reduce: jest.fn((eventName, variableToReduce) => variableToReduce),
    };
    const tempFiles = {
      write: jest.fn((filepath) => Promise.resolve(filepath)),
    };
    const target = {
      name: 'charito',
      paths: {
        source: 'src',
      },
      html: {
        template: 'index.html',
      },
    };
    let sut = null;
    const expectedFilepath = `${target.name}.index.html`;
    const expectedHTML = '<!doctype html>' +
      '<html lang="en">' +
      '<head>' +
      ' <meta charset="utf-8" />' +
      ' <meta http-equiv="x-ua-compatible" content="ie=edge" />' +
      ' <meta name="viewport" content="width=device-width, initial-scale=1" />' +
      ` <title>${target.name}</title>` +
      '</head>' +
      '<body>' +
      ' <div id="app"></div>' +
      '</body>' +
      '</html>';
    const expectedEvents = {
      'target-default-html-settings': [
        {
          title: target.name,
          bodyAttributes: '',
          bodyContents: '<div id="app"></div>',
        },
        target,
      ],
      'target-default-html': [
        expectedHTML,
        target,
      ],
    };
    const expectedEventNames = Object.keys(expectedEvents);
    // When
    sut = new TargetsHTML(events, tempFiles);
    return sut.getHTMLFilepath(target)
    .then((result) => {
      // Then
      expect(result).toBe(expectedFilepath);
      expect(fs.pathExists).toHaveBeenCalledTimes(1);
      expect(fs.pathExists).toHaveBeenCalledWith(`${target.paths.source}/${target.html.template}`);
      expect(events.reduce).toHaveBeenCalledTimes(expectedEventNames.length);
      expectedEventNames.forEach((eventName) => {
        expect(events.reduce).toHaveBeenCalledWith(eventName, ...expectedEvents[eventName]);
      });
      expect(tempFiles.write).toHaveBeenCalledTimes(1);
      expect(tempFiles.write).toHaveBeenCalledWith(expectedFilepath, expectedHTML);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should generate a default HTML file with custom settings', () => {
    // Given
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(false));
    const settingsEventName = 'target-default-html-settings';
    const settings = {
      title: 'My App',
      bodyAttributes: 'data-custom-something="charito"',
      bodyContents: '<span class="my-app" data-hello></span>',
    };
    const events = {
      reduce: jest.fn((eventName, variableToReduce) => (
        eventName === settingsEventName ?
          settings :
          variableToReduce
      )),
    };
    const tempFiles = {
      write: jest.fn((filepath) => Promise.resolve(filepath)),
    };
    const target = {
      name: 'charito',
      paths: {
        source: 'src',
      },
      html: {
        template: 'index.html',
      },
    };
    let sut = null;
    const expectedFilepath = `${target.name}.index.html`;
    const expectedHTML = '<!doctype html>' +
      '<html lang="en">' +
      '<head>' +
      ' <meta charset="utf-8" />' +
      ' <meta http-equiv="x-ua-compatible" content="ie=edge" />' +
      ' <meta name="viewport" content="width=device-width, initial-scale=1" />' +
      ` <title>${settings.title}</title>` +
      '</head>' +
      `<body ${settings.bodyAttributes}>` +
      ` ${settings.bodyContents}` +
      '</body>' +
      '</html>';
    const expectedEvents = {
      [settingsEventName]: [
        {
          title: target.name,
          bodyAttributes: '',
          bodyContents: '<div id="app"></div>',
        },
        target,
      ],
      'target-default-html': [
        expectedHTML,
        target,
      ],
    };
    const expectedEventNames = Object.keys(expectedEvents);
    // When
    sut = new TargetsHTML(events, tempFiles);
    return sut.getHTMLFilepath(target)
    .then((result) => {
      // Then
      expect(result).toBe(expectedFilepath);
      expect(fs.pathExists).toHaveBeenCalledTimes(1);
      expect(fs.pathExists).toHaveBeenCalledWith(`${target.paths.source}/${target.html.template}`);
      expect(events.reduce).toHaveBeenCalledTimes(expectedEventNames.length);
      expectedEventNames.forEach((eventName) => {
        expect(events.reduce).toHaveBeenCalledWith(eventName, ...expectedEvents[eventName]);
      });
      expect(tempFiles.write).toHaveBeenCalledTimes(1);
      expect(tempFiles.write).toHaveBeenCalledWith(expectedFilepath, expectedHTML);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should return the path for a custom HTML file', () => {
    // Given
    fs.pathExists.mockImplementationOnce(() => Promise.resolve(true));
    const events = 'events';
    const tempFiles = 'tempFiles';
    const target = {
      paths: {
        source: 'src',
      },
      html: {
        template: 'index.html',
      },
    };
    let sut = null;
    const expectedFilepath = `${target.paths.source}/${target.html.template}`;
    // When
    sut = new TargetsHTML(events, tempFiles);
    return sut.getHTMLFilepath(target)
    .then((result) => {
      // Then
      expect(result).toBe(expectedFilepath);
      expect(fs.pathExists).toHaveBeenCalledTimes(1);
      expect(fs.pathExists).toHaveBeenCalledWith(expectedFilepath);
    })
    .catch(() => {
      expect(true).toBeFalse();
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    targetsHTML(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('targetsHTML');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBeFunction();
  });
});
