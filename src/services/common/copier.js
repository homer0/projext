const fs = require('fs-extra');
const path = require('path');
const { provider } = require('jimple');

class Copier {
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

  static copyModule(from, to) {
    const ignore = ['package-lock.json', 'node_modules'];
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

  static pathExists(item) {
    return fs.pathExists(item)
    .then((exists) => ({
      item,
      exists,
    }));
  }
}

const copier = provider((app) => {
  app.set('copier', () => Copier.copy.bind(Copier));
});

module.exports = {
  Copier,
  copier,
};
