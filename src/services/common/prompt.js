const promptTool = require('prompt');
const { provider } = require('jimple');
/**
 * This services works as an abstraction of the `prompt` package in order to add support for
 * Promises, fix some quirks regarding boolean options, customize the interface just once and,
 * finally, integrate it withe Jimple.
 */
class Prompt {
  /**
   * Class constructor.
   * @param {string} [messagesPrefix=''] A prefix text that will be shown before each message.
   */
  constructor(messagesPrefix = '') {
    // Overwrite the default prefix.
    promptTool.message = messagesPrefix;
    /**
     * Set a single space as a delimiter between the messages components (prefix, question and
     * default value).
     */
    promptTool.delimiter = ' ';
    // Disable colors because `prompt` has a hardcoded gray on the texts.
    promptTool.colors = false;
  }
  /**
   * Invoke the `prompt` package and ask the user for input.
   * @param {Object} schema The input data schema. For more information on how to build it, you
   *                        should check the `prompt` package documentation, it's pretty complete.
   *                        IMPORTANT: On the `prompt` documentation, this object would be the
   *                        `properties` inside their `schema` object.
   * @return {Promise<Object,Error>} If everything goes well, the resolved value is an object with
   *                                 the values the user entered; and if the user cancels the input,
   *                                 you'll get an error with the message `canceled`.
   */
  ask(schema) {
    // Copy the schema into a new object in order to modify it.
    const newSchema = Object.assign({}, schema);
    // Loop all the properties.
    Object.keys(newSchema).forEach((name) => {
      const property = newSchema[name];
      // If the property type is `boolean`, use the helper method to add the validation properties.
      if (property.type === 'boolean') {
        newSchema[name] = this._booleanHelper(property);
      }
    });
    // Return a _"promisified"_ implementation of `prompt`.
    return new Promise((resolve, reject) => {
      promptTool.get({ properties: newSchema }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
  /**
   * Access the history of the prompt.
   * @param {string} property The name of the property you want to look on the history.
   * @return {?Object} If the property is present, it will return an object with the name as
   *                   `property` and its `value`, otherwise it will return `undefined`.
   */
  history(property) {
    return promptTool.history(property);
  }
  /**
   * Get a property value from the history.
   * @param {string} property The name of the property.
   * @return {?string} If the property is on the history, it will return its value, otherwise it
   *                   will return `undefined`.
   */
  getValue(property) {
    const saved = this.history(property);
    let result;
    if (saved && typeof saved.value !== 'undefined') {
      result = saved.value;
    }

    return result;
  }
  /**
   * The default implementation of boolean properties is not very friendly and it only accepts
   * `true`, `t`, `false` or `f`, which is not _"human friendly"_, so this method changes boolean
   * properties into string properties and add validations for `yes`, `y`, `no` and `n`. It also
   * _"booleanizes"_ the input so when the results are resolved, the value will be a real `boolean`.
   * @param {Object} property The property to format.
   * @return {Object} The updated property.
   * @ignore
   * @access protected
   */
  _booleanHelper(property) {
    return Object.assign({}, property, {
      type: 'string',
      message: 'You can only answer with \'yes\' or \'no\'',
      conform: (value) => ['yes', 'y', 'no', 'n'].includes(value.toLowerCase()),
      before: (value) => ['yes', 'y'].includes(value.toLowerCase()),
    });
  }
}
/**
 * Generates a `Provider` with an already defined message prefix.
 * @example
 * // Generate the provider
 * const provider = promptWithOptions('my-prefix');
 * // Register it on the container
 * container.register(provider);
 * // Getting access to the service instance
 * const prompt = container.get('prompt');
 * @param {string} [messagesPrefix] A prefix to include in front of all the messages.
 * @return {Provider}
 */
const promptWithOptions = (messagesPrefix) => provider((app) => {
  app.set('prompt', () => new Prompt(messagesPrefix));
});
/**
 * The service provider that once registered on the app container will set an instance of
 * `Prompt` as the `prompt` service.
 * @example
 * // Register it on the container
 * container.register(prompt);
 * // Getting access to the service instance
 * const prompt = container.get('prompt');
 * @type {Provider}
 */
const prompt = promptWithOptions();
/**
 * The service provider that once registered on the app container will set an instance of
 * `Prompt` as the `appPrompt` service. The difference with the regular `prompt` is that this one
 * uses the `packageInfo` service in order to retrieve the name of the project and use it as
 * messages prefix.
 * @example
 * // Register it on the container
 * container.register(appPrompt);
 * // Getting access to the service instance
 * const appPrompt = container.get('appPrompt');
 * @type {Provider}
 */
const appPrompt = provider((app) => {
  app.set('appPrompt', () => {
    const packageInfo = app.get('packageInfo');
    const prefix = packageInfo.nameForCLI || packageInfo.name;
    return new Prompt(prefix);
  });
});

module.exports = {
  Prompt,
  promptWithOptions,
  prompt,
  appPrompt,
};
