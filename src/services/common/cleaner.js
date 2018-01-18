const del = require('del');
const { provider } = require('jimple');
/**
 * A simple class with only one static method that removes items from directories.
 */
class Cleaner {
  /**
   * Remove items that match a glob pattern from a given directory.
   * @param {String}  directory            The path to the target directory.
   * @param {Array}   files                The list of files/folders to remove.
   * @param {Boolean} [removeOthers=false] If `true`, it will remove everything but the specified
   *                                       `files`.
   * @return {Promise<undefined,Error>}
   */
  static clean(directory, files, removeOthers = false) {
    const items = [];
    let flag = '';
    if (removeOthers) {
      items.push(`${directory}/**`);
      items.push(`!${directory}`);
      flag = '!';
    }

    if (Array.isArray(files)) {
      files.forEach((file) => {
        items.push(`${flag}${directory}/${file}`);
      });
    } else {
      items.push(`${directory}/${files}`);
    }

    return del(items);
  }
}
/**
 * The service provider that once registered on the app container will set `Cleaner.clean` as the
 * `cleaner` service.
 * @example
 * // Register is on the container
 * container.register(cleaner);
 * // Getting access to the service instance
 * const cleaner = container.get('cleaner');
 * @type {Provider}
 */
const cleaner = provider((app) => {
  app.set('cleaner', () => Cleaner.clean);
});

module.exports = {
  Cleaner,
  cleaner,
};
