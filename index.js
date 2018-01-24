const path = require('path');
const { Woopack } = require('./src');

let builder;
try {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  builder = require(path.join(process.cwd(), 'woopack.config.js'));
} catch (e) {
  builder = new Woopack();
}

module.exports = builder;
