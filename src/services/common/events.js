const { provider } = require('jimple');
const { EventsHub } = require('wootils/shared');

class Events extends EventsHub {

}

const events = provider((app) => {
  app.set('events', () => new Events());
});

module.exports = {
  Events,
  events,
};
