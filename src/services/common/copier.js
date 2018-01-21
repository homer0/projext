const fs = require('fs-extra');
const path = require('path');
const { provider } = require('jimple');
/**
 * A service to copy items.
 */
class Copier {
  /**
   * Copy a list of items between an `origin` directory and a `target` directory.
   * @param {String} origin The path to the origin directory.
   * @param {String} target The path to the target directory.
   * @param {Array}  items  The list of items to copy. Each item can be a `string` with the path to
   *                        the item, or an object with origin path of the file as key and the
   *                        target path as value.
   * @return {Promise<Array,Error>} If everything goes well, the promise will resolve on a list
   *                                with the information of every item it copied.
   */
  static copy(origin, target, items) {
    const paths = [];
    const list = items.map((item) => {
      const result = {
        from: '',
        to: '',
      };

      if (typeof item === 'string') {
        result.from = path.join(origin, item);
        result.to = path.join(target, item);
        result.isModule = item.startsWith('node_modules');
      } else {
        const [name] = Object.keys(item);
        result.from = path.join(origin, name);
        result.to = path.join(target, item[name]);
        result.isModule = name.startsWith('node_modules');
      }

      paths.push(result.from);
      return result;
    });

    return this.findMissingItems(paths)
    .then(() => Promise.all(list.map((item) => (item.isModule ?
      this.copyModule(item.from, item.to) :
      this.copyFile(item.from, item.to)
    ))));
  }
  /**
   * Copy a single file from one location to another.
   * @param {String} from The current location of the file.
   * @param {String} to   The location of the copy.
   * @return {Promise<Object,Object>} The promise will resolve on an object with the information of
   *                                  the process: `from`, `to` and `success`.
   */
  static copyFile(from, to) {
    return fs.copy(from, to)
    .then(() => ({
      from,
      to,
      success: true,
    }))
    .catch((error) => ({
      from,
      to,
      error,
      success: false,
    }));
  }
  /**
   * Copy a Node module. The reason this is different from `copyFile` is because instead of copying
   * the entire module, we first read all the files on its directory, remove its modules and the
   * lock files and then copy all the rest.
   * @param {String} from The module path.
   * @param {String} to   The path to where it will be copied.
   * @return {Promise<Object,Object>} The promise will resolve on an object with the information of
   *                                  the process: `from`, `to` and `success`.
   */
  static copyModule(from, to) {
    const ignore = ['yarn.lock', 'package-lock.json', 'node_modules'];
    return fs.ensureDir(to)
    .then(() => fs.readdir(from))
    .then((files) => Promise.all(
      files
      .filter((file) => !ignore.includes(file))
      .map((file) => fs.copy(path.join(from, file), path.join(to, file)))
    ))
    .then(() => ({
      from,
      to,
      success: true,
    }))
    .catch((error) => ({
      from,
      to,
      error,
      success: false,
    }));
  }
  /**
   * Given a list of items, find if any of them doesn't exist.
   * @param {Array} items A list of paths.
   * @return {Promise<Array,Error>} If everything goes well, the promise will resolve on a list of
   *                                objects with the path for the `item` and a flag to indicate if
   *                                they `exists`.
   */
  static findMissingItems(items) {
    return Promise.all(items.map((item) => this.pathExists(item)))
    .then((results) => {
      let result = {};
      const missing = results.find((item) => !item.exists);
      if (missing) {
        result = Promise.reject(
          new Error(`Error: ${missing.item} can't be copied because it doesn't exist`)
        );
      }

      return result;
    });
  }
  /**
   * Check if an item exists.
   * @param  {String} item The path for the item.
   * @return {Promise<Object,Error>} If everything goes well, the promise will resolve on an object
   *                                 with the keys `item`, for the item path, and `exists` to
   *                                 indicate whether the item exists or not.
   */
  static pathExists(item) {
    return fs.pathExists(item)
    .then((exists) => ({
      item,
      exists,
    }));
  }
}
/**
 * The service provider that once registered on the app container will set `Copier.copy` as the
 * `copier` service.
 * @example
 * // Register it on the container
 * container.register(copier);
 * // Getting access to the service instance
 * const copier = container.get('copier');
 * @type {Provider}
 */
const copier = provider((app) => {
  app.set('copier', () => Copier.copy.bind(Copier));
});

module.exports = {
  Copier,
  copier,
};
