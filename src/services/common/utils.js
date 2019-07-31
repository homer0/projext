const path = require('path');
const { provider } = require('jimple');
/**
 * A set of generic utilities that can be used in any context.
 */
class Utils {
  /**
   * Replace a dictionary of given placeholders on a string.
   * @param  {string} string              The target string where the placeholders will be
   *                                      replaced.
   * @param  {Object} placeholders        A dictionary with its placholders and their values.
   * @param  {String} [beforePlaceholder] Optional. The left limiter for the placeholder. This will
   *                                      end up on a regular expression, so if it includes special
   *                                      symbols (`[]{}/.`), they neeed to be escaped.
   *                                      The default value is `\\[`.
   * @param  {String} [afterPlaceholder]  Optional. The right limiter for the placeholder. This will
   *                                      end up on a regular expression, so if it includes special
   *                                      symbols (`[]{}/.`), they neeed to be escaped.
   *                                      The default value is `\\[`.
   * @return {string}
   */
  static replacePlaceholders(
    string,
    placeholders,
    beforePlaceholder = '\\[',
    afterPlaceholder = '\\]'
  ) {
    let newString = string;
    Object.keys(placeholders).forEach((name) => {
      newString = newString.replace(
        RegExp(`${beforePlaceholder}${name}${afterPlaceholder}`, 'ig'),
        placeholders[name]
      );
    });

    return newString;
  }
  /**
   * Formats a list of strings into a _"human readable list".
   * @example
   * console.log(Utils.humanReadableList(['one', 'two', 'three']));
   * // Will output 'one, two or three'
   *
   * console.log(Utils.humanReadableList(['one', 'two', 'three'], 'and'));
   * // Will output 'one, two and three'
   *
   * @param {Array}  list                A list of strings to format.
   * @param {string} [conjunction='or'] The conjunction to be added between the last two items.
   * @return {string}
   */
  static humanReadableList(list, conjunction = 'or') {
    let result = '';
    if (list.length === 1) {
      [result] = list;
    } else if (list.length > 1) {
      const comma = ', ';
      const str = list.join(comma);
      const lastComma = str.lastIndexOf(comma);
      const before = str.substr(0, lastComma);
      const after = str.substr(lastComma + comma.length);
      result = `${before} ${conjunction} ${after}`;
    }

    return result;
  }
  /**
   * This a helper for when projext deals with non-JS files, like `.jsx` or `.ts`. Given a path for
   * a file, the method will make sure that the extension used is the one specified (`js by
   * default).
   * @example
   * console.log(Utils.ensureExtension('my/file/path.ts');
   * // Will output `my/file/path.js`
   *
   * @param {string} filepath         The path for the file.
   * @param {string} [extension='js'] The extension to validate.
   * @return {string}
   */
  static ensureExtension(filepath, extension = 'js') {
    let result;
    const parsed = path.parse(filepath);
    if (parsed.ext.toLowerCase().endsWith(`.${extension}`)) {
      result = filepath;
    } else {
      result = path.join(parsed.dir, `${parsed.name}.${extension}`);
    }

    return result;
  }
}
/**
 * The service provider that once registered on the app container will set a reference of
 * `Utils` as the `utils` service.
 * @example
 * // Register it on the container
 * container.register(utils);
 * // Getting access to the service reference
 * const utils = container.get('utils');
 * @type {Provider}
 */
const utils = provider((app) => {
  app.set('utils', () => Utils);
});

module.exports = {
  Utils,
  utils,
};
