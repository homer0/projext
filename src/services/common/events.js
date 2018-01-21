const { provider } = require('jimple');
const { EventsHub } = require('wootils/shared');
/**
 * A simple events hub to manage the app events.
 * @extends {EventsHub}
 */
class Events extends EventsHub {}
/**
 * The service provider that once registered on the app container will set an instance of
 * `Events` as the `events` service.
 * @example
 * // Register it on the container
 * container.register(events);
 * // Getting access to the service instance
 * const events = container.get('events');
 * @type {Provider}
 */
const events = provider((app) => {
  app.set('events', () => new Events());
});

module.exports = {
  Events,
  events,
};
