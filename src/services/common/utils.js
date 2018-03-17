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
