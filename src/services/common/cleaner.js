const del = require('del');
const { provider } = require('jimple');

class Cleaner {
  static clean(directory, files, removeOthers) {
    const items = [];
    let flag = '';
    if (removeOthers) {
      items.push(`${directory}/**`);
      items.push(`!${directory}`);
      flag = '!';
    }

    if (Array.isArray(files)) {
      files.forEach((file) => {
        items.push(`${flag}${directory}/${file}.js`);
      });
    } else {
      items.push(`${directory}/${files}`);
    }

    return del(items);
  }
}

const cleaner = provider((app) => {
  app.set('cleaner', () => Cleaner.clean);
});

module.exports = {
  Cleaner,
  cleaner,
};
