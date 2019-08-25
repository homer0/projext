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
    fs.pathExistsSync.mockReset();
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

  it('should validate a target HTML template exists and return its path', () => {
    // Given
    const exists = true;
    fs.pathExistsSync.mockReturnValueOnce(exists);
    const events = 'events';
    const tempFiles = 'tempFiles';
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
    let result = null;
    // When
    sut = new TargetsHTML(events, tempFiles);
    result = sut.validate(target);
    // Then
    expect(result).toEqual({
      path: `${target.paths.source}/${target.html.template}`,
      exists,
    });
  });

  it('should generate a default HTML file for the target and return its path', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
    const events = {
      reduce: jest.fn((eventName, variableToReduce) => variableToReduce),
    };
    const tempFiles = {
      writeSync: jest.fn((filepath) => filepath),
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
    let result = null;
    const expectedFilepath = `${target.name}.index.html`;
    const expectedHTML = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      ' <meta charset="utf-8" />',
      ' <meta http-equiv="x-ua-compatible" content="ie=edge" />',
      ' <meta name="viewport" content="width=device-width, initial-scale=1" />',
      ` <title>${target.name}</title>`,
      '</head>',
      '<body>',
      ' <div id="app"></div>',
      '</body>',
      '</html>',
    ].join('\n');
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
    result = sut.getFilepath(target);
    // Then
    expect(result).toBe(expectedFilepath);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${target.paths.source}/${target.html.template}`);
    expect(events.reduce).toHaveBeenCalledTimes(expectedEventNames.length);
    expectedEventNames.forEach((eventName) => {
      expect(events.reduce).toHaveBeenCalledWith(eventName, ...expectedEvents[eventName]);
    });
    expect(tempFiles.writeSync).toHaveBeenCalledTimes(1);
    expect(tempFiles.writeSync).toHaveBeenCalledWith(expectedFilepath, expectedHTML);
  });

  it('should generate a default HTML file for the target with a name with a scope', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
    const events = {
      reduce: jest.fn((eventName, variableToReduce) => variableToReduce),
    };
    const tempFiles = {
      writeSync: jest.fn((filepath) => filepath),
    };
    const targetNameScope = '@homer0';
    const targetNamePackage = 'charito';
    const target = {
      name: `${targetNameScope}/${targetNamePackage}`,
      paths: {
        source: 'src',
      },
      html: {
        template: 'index.html',
      },
    };
    let sut = null;
    let result = null;
    const expectedTargetFileName = `${targetNameScope}-${targetNamePackage}`;
    const expectedFilepath = `${expectedTargetFileName}.index.html`;
    const expectedHTML = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      ' <meta charset="utf-8" />',
      ' <meta http-equiv="x-ua-compatible" content="ie=edge" />',
      ' <meta name="viewport" content="width=device-width, initial-scale=1" />',
      ` <title>${target.name}</title>`,
      '</head>',
      '<body>',
      ' <div id="app"></div>',
      '</body>',
      '</html>',
    ].join('\n');
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
    result = sut.getFilepath(target);
    // Then
    expect(result).toBe(expectedFilepath);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${target.paths.source}/${target.html.template}`);
    expect(events.reduce).toHaveBeenCalledTimes(expectedEventNames.length);
    expectedEventNames.forEach((eventName) => {
      expect(events.reduce).toHaveBeenCalledWith(eventName, ...expectedEvents[eventName]);
    });
    expect(tempFiles.writeSync).toHaveBeenCalledTimes(1);
    expect(tempFiles.writeSync).toHaveBeenCalledWith(expectedFilepath, expectedHTML);
  });

  it('should generate a default HTML file for the target even if the target has a one', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
    const events = {
      reduce: jest.fn((eventName, variableToReduce) => variableToReduce),
    };
    const tempFiles = {
      writeSync: jest.fn((filepath) => filepath),
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
    let result = null;
    const expectedFilepath = `${target.name}.index.html`;
    const expectedHTML = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      ' <meta charset="utf-8" />',
      ' <meta http-equiv="x-ua-compatible" content="ie=edge" />',
      ' <meta name="viewport" content="width=device-width, initial-scale=1" />',
      ` <title>${target.name}</title>`,
      '</head>',
      '<body>',
      ' <div id="app"></div>',
      '</body>',
      '</html>',
    ].join('\n');
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
    result = sut.getFilepath(target, true);
    // Then
    expect(result).toBe(expectedFilepath);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${target.paths.source}/${target.html.template}`);
    expect(events.reduce).toHaveBeenCalledTimes(expectedEventNames.length);
    expectedEventNames.forEach((eventName) => {
      expect(events.reduce).toHaveBeenCalledWith(eventName, ...expectedEvents[eventName]);
    });
    expect(tempFiles.writeSync).toHaveBeenCalledTimes(1);
    expect(tempFiles.writeSync).toHaveBeenCalledWith(expectedFilepath, expectedHTML);
  });

  it('should generate a default HTML file with custom settings', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(false);
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
      writeSync: jest.fn((filepath) => filepath),
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
    let result = null;
    const expectedFilepath = `${target.name}.index.html`;
    const expectedHTML = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      ' <meta charset="utf-8" />',
      ' <meta http-equiv="x-ua-compatible" content="ie=edge" />',
      ' <meta name="viewport" content="width=device-width, initial-scale=1" />',
      ` <title>${settings.title}</title>`,
      '</head>',
      `<body ${settings.bodyAttributes}>`,
      ` ${settings.bodyContents}`,
      '</body>',
      '</html>',
    ].join('\n');
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
    result = sut.getFilepath(target);
    // Then
    expect(result).toBe(expectedFilepath);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(`${target.paths.source}/${target.html.template}`);
    expect(events.reduce).toHaveBeenCalledTimes(expectedEventNames.length);
    expectedEventNames.forEach((eventName) => {
      expect(events.reduce).toHaveBeenCalledWith(eventName, ...expectedEvents[eventName]);
    });
    expect(tempFiles.writeSync).toHaveBeenCalledTimes(1);
    expect(tempFiles.writeSync).toHaveBeenCalledWith(expectedFilepath, expectedHTML);
  });

  it('should return the path for a custom HTML file', () => {
    // Given
    fs.pathExistsSync.mockReturnValueOnce(true);
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
    let result = null;
    const expectedFilepath = `${target.paths.source}/${target.html.template}`;
    // When
    sut = new TargetsHTML(events, tempFiles);
    result = sut.getFilepath(target);
    // Then
    expect(result).toBe(expectedFilepath);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(expectedFilepath);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    targetsHTML(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('targetsHTML');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(TargetsHTML);
    expect(sut.events).toBe('events');
    expect(sut.tempFiles).toBe('tempFiles');
  });
});
