jest.unmock('/src/abstracts/cliSubCommand');

require('jasmine-expect');
const CLISubCommand = require('/src/abstracts/cliSubCommand');

describe('abstracts:CLISubCommand', () => {
  it('should throw an error if used without subclassing it', () => {
    // Given/When/Then
    expect(() => new CLISubCommand())
    .toThrow(/CLISubCommand is an abstract class/i);
  });

  it('should be able to be instantiated when subclassed', () => {
    // Given
    class Sut extends CLISubCommand {}
    let sut = null;
    // When
    sut = new Sut();
    // Then
    expect(sut).toBeInstanceOf(Sut);
    expect(sut).toBeInstanceOf(CLISubCommand);
  });

  it('should be able to register new options', () => {
    // Given
    const optionOne = {
      name: 'type',
      instruction: '-t',
    };
    const optionTwo = {
      name: 'env',
      instruction: '-e',
      description: 'Set the environment',
    };
    const optionThree = {
      name: 'build',
      instruction: '-b',
      description: 'Set the build',
      defaultValue: true,
    };
    const numberOfOptions = 3;
    class Sut extends CLISubCommand {}
    let sut = null;
    // When
    sut = new Sut();
    sut.addOption(optionOne.name, optionOne.instruction);
    sut.addOption(optionTwo.name, optionTwo.instruction, optionTwo.description);
    sut.addOption(
      optionThree.name,
      optionThree.instruction,
      optionThree.description,
      optionThree.defaultValue
    );
    // Then
    expect(sut.options.length).toBe(numberOfOptions);
    expect(sut.options).toEqual([optionOne.name, optionTwo.name, optionThree.name]);
    expect(sut.optionsByName[optionOne.name]).toEqual({
      name: optionOne.name,
      instruction: optionOne.instruction,
      description: '',
      defaultValue: '',
    });
    expect(sut.optionsByName[optionTwo.name]).toEqual({
      name: optionTwo.name,
      instruction: optionTwo.instruction,
      description: optionTwo.description,
      defaultValue: '',
    });
    expect(sut.optionsByName[optionThree.name]).toEqual({
      name: optionThree.name,
      instruction: optionThree.instruction,
      description: optionThree.description,
      defaultValue: optionThree.defaultValue,
    });
  });

  it('should be able to generate a help for the CLI', () => {
    // Given
    const name = 'my-name';
    const description = 'Something';
    class Sut extends CLISubCommand {}
    let sut = null;
    let result = null;
    const expectedDescription = ` - '${name}': ${description}`;
    // When
    sut = new Sut();
    sut.name = name;
    sut.description = description;
    result = sut.getHelpInformation();
    // Then
    expect(result).toBe(expectedDescription);
  });

  it('should be able to generate a help for the CLI and add the options detail', () => {
    // Given
    const optionOne = {
      name: 'type',
      instruction: '-t, --type [type]',
      description: 'Set the type',
    };
    const optionTwo = {
      name: 'env',
      instruction: '-e, --env [env]',
      description: 'Set the environment',
    };
    const optionThree = {
      name: 'build',
      instruction: '-b, --build',
      description: 'Set the build',
    };
    const name = 'my-name';
    const description = 'Something';
    class Sut extends CLISubCommand {}
    let sut = null;
    let result = null;
    const expectedDescription = ` - '${name}': ${description}` +
      '\n   Options:\n' +
      `\n   -t, --type [type]  ${optionOne.description}` +
      `\n   -e, --env [env]    ${optionTwo.description}` +
      `\n   -b, --build        ${optionThree.description}`;
    // When
    sut = new Sut();
    sut.name = name;
    sut.description = description;
    sut.addOption(optionOne.name, optionOne.instruction, optionOne.description);
    sut.addOption(optionTwo.name, optionTwo.instruction, optionTwo.description);
    sut.addOption(optionThree.name, optionThree.instruction, optionThree.description);
    result = sut.getHelpInformation();
    // Then
    expect(result).toBe(expectedDescription);
  });

  it('should throw an error if the `handle` method is not overwritten', () => {
    // Given
    class Sut extends CLISubCommand {}
    let sut = null;
    // When/Then
    sut = new Sut();
    expect(() => sut.handle()).toThrow(/This method must to be overwritten/i);
  });
});
