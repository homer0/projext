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
