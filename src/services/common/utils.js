const path = require('path');
const ObjectUtils = require('wootils/shared/objectUtils');
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
   * Returns the value of an object property using a path.
   * @example
   * const obj = {
   *   propOne: {
   *     propOneSub: 'Charito!',
   *   },
   *   propTwo: '!!!',
   * };
   * console.log(Utils.getPropertyWithPath(
   *   obj,
   *   'propOne/propOneSub'
   * ));
   * // Will output `Charito!`
   *
   * @param {Object} obj                 The object from where the property will be read.
   * @param {string} objPath             The path to the property.
   * @param {string} [pathDelimiter='/'] The delimiter that will separate the path components.
   * @return {*}
   * @throws {Error} If the path is invalid.
   * @deprecated
   */
  static getPropertyWithPath(obj, objPath, pathDelimiter = '/') {
    const parts = objPath.split(pathDelimiter);
    const first = parts.shift();
    let currentElement = obj[first];
    if (typeof currentElement === 'undefined') {
      throw new Error(`There's nothing on '${objPath}'`);
    } else if (parts.length) {
      let currentPath = first;
      parts.forEach((currentPart) => {
        currentPath += `/${currentPart}`;
        currentElement = currentElement[currentPart];
        if (typeof currentElement === 'undefined') {
          throw new Error(`There's nothing on '${currentPath}'`);
        }
      });
    }

    return currentElement;
  }
  /**
   * Deletes a property of an object using a path.
   * @example
   * const obj = {
   *   propOne: {
   *     propOneSub: 'Charito!',
   *   },
   *   propTwo: '!!!',
   * };
   * console.log(Utils.deletePropertyWithPath(
   *   obj,
   *   'propOne/propOneSub'
   * ));
   * // Will output `{ propTwo: '!!!' }`
   *
   * @param {Object}  obj                         The object from where the property will be
   *                                              removed.
   * @param {string}  objPath                     The path to the property.
   * @param {String}  [pathDelimiter='/']         The delimiter that will separate the path
   *                                              components.
   * @param {Boolean} [cleanEmptyProperties=true] If this flag is `true` and after removing the
   *                                              property the parent object is empty, it will
   *                                              remove it recursively until a non empty parent
   *                                              object is found.
   * @return {Object} A copy of the original object with the removed property/properties.
   * @deprecated
   */
  static deletePropertyWithPath(obj, objPath, pathDelimiter = '/', cleanEmptyProperties = true) {
    const parts = objPath.split(pathDelimiter);
    const last = parts.pop();
    let result = ObjectUtils.copy(obj);
    if (parts.length) {
      const parentPath = parts.join(pathDelimiter);
      const parentObj = Utils.getPropertyWithPath(result, parentPath, pathDelimiter);
      delete parentObj[last];
      if (cleanEmptyProperties && !Object.keys(parentObj).length) {
        result = Utils.deletePropertyWithPath(
          result,
          parentPath,
          pathDelimiter,
          cleanEmptyProperties
        );
      }
    } else {
      delete result[last];
    }

    return result;
  }
  /**
   * Sets a property on an object using a path. If the path doesn't exist, it will be created.
   * @example
   * const obj = {};
   * console.log(Utils.setPropertyWithPath(obj, 'some/prop/path', 'some-value'));
   * // Will output `{ some: { prop: { path: 'some-value' } } }`
   *
   * @param {Object} obj                 The object where the property will be set.
   * @param {string} objPath             The path for the property.
   * @param {*}      value               The value to set on the property.
   * @param {string} [pathDelimiter='/'] The delimiter that will separate the path components.
   * @return {Object} A copy of the original object with the added property/properties.
   * @deprecated
   */
  static setPropertyWithPath(obj, objPath, value, pathDelimiter = '/') {
    const result = ObjectUtils.copy(obj);
    const parts = objPath.split(pathDelimiter);
    const last = parts.pop();
    let currentElement = result;
    let currentPath = '';
    parts.forEach((part) => {
      currentPath += `/${part}`;
      const element = currentElement[part];
      const elementType = typeof element;
      if (elementType === 'undefined') {
        currentElement[part] = {};
        currentElement = currentElement[part];
      } else if (elementType === 'object' && !Array.isArray(element)) {
        currentElement = currentElement[part];
      } else {
        const type = elementType === 'object' ? 'array' : elementType;
        const errorPath = currentPath.substr(1);
        throw new Error(`There's already an element of type '${type}' on '${errorPath}'`);
      }
    });

    currentElement[last] = value;
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
