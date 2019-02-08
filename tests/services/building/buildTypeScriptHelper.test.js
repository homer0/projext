const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/building/buildTypeScriptHelper');

require('jasmine-expect');
const {
  BuildTypeScriptHelper,
  buildTypeScriptHelper,
} = require('/src/services/building/buildTypeScriptHelper');

describe('services/building:buildTypeScriptHelper', () => {
  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new BuildTypeScriptHelper();
    // Then
    expect(sut).toBeInstanceOf(BuildTypeScriptHelper);
  });

  it('should generate the command to emit a target declaration files', () => {
    // Given
    const source = 'src';
    const build = 'build';
    const target = {
      paths: {
        source,
        build,
      },
    };
    let sut = null;
    let result = null;
    // When
    sut = new BuildTypeScriptHelper();
    result = sut.getDeclarationsCommand(target);
    // Then
    expect(result).toBe(`tsc --emitDeclarationOnly --outDir ${build} --rootDir ${source}`);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    buildTypeScriptHelper(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('buildTypeScriptHelper');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(BuildTypeScriptHelper);
  });
});
