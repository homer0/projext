const path = require('path');
const { Projext } = require('./src');

let builder;
try {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  builder = require(path.join(process.cwd(), 'projext.config.js'));
} catch (e) {
  builder = new Projext();
}

module.exports = builder;
