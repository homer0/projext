const { provider } = require('jimple');

/**
 * The best and random class ever seen!! 
 */
class MigueService {
  
  /**
   * returns the magic words that the great migue says to get everything he want 
   */
  static getMagicWords() {
    return 'y eia?';
  }
  
  /**
   * if you need a "wait message" for your prompt, well, u can call this function
   * and a freaking migue's style message will be returned!! 
   */
  static getWaitMessage() {
     const waitMessages = [
       'yo, wait a minute :)',
       'cmon dude, be patient',
       '...',
       '... ಠ_ಠ really, wait',
       '(Ծ‸ Ծ) sit down, breathe, and wait',
       'ok, it\'s enough for me, i\'m going to tie you to a chair',
       '. . .  (._.)  i said, wait . . . ',
       '(╯°□°）╯︵ ┻━┻   WAAAIIIIIITT !! ',
       'T_T please, wait, i\'m fking tired'
     ];
    return waitMessages[Math.floor(Math.random() * waitMessages.length)];
  }
  
  /**
   * just a greet ;)
   */
  static greet() {
    return 'Aurelia Rulezzz';
  }
  
  /**
   * who i am ... no, sry, who "the service" is
   */
  static myName() {
    return 'Migue'; 
  }
}

/**
 * The service provider that once registered on the app container will set a reference of
 * `MigueService` as the `migueService` service.
 * @example
 * // Register it on the container
 * container.register(migueService);
 * // Getting access to the service reference
 * const migueService = container.get('migueService');
 * @type {Provider}
 */
const migueService = provider((app) => {
  app.set('migueService', () => MigueService);
});

module.exports = {
  MigueService,
  migueService
};

