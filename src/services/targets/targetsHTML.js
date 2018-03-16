const path = require('path');
const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * This service allows the validation of a {@link BrowserTarget} `html.template` file and it also
 * takes care of generating a _"default template"_ if the one on the target settings doesn't exist.
 */
class TargetsHTML {
  /**
   * Class constructor.
   * @param {Events}    events    To reduce the settings and the template of the generated HTML
   *                              files.
   * @param {TempFiles} tempFiles To save a generated HTML file on the temp directory.
   */
  constructor(events, tempFiles) {
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * A local reference for the `tempFiles` service.
     * @type {TempFiles}
     */
    this.tempFiles = tempFiles;
    /**
     * Bind the method so it can be registered as the service itself.
     * @ignore
     */
    this.getHTMLFilepath = this.getHTMLFilepath.bind(this);
  }
  /**
   * Given a target, this method will validate if the target has an HTML template file and return
   * its absolute path; if the file doesn't exists, it will generate a new one, save it on the
   * temp directory and return its path.
   * @param {Target} target The target information.
   * @return {string}
   */
  getHTMLFilepath(target) {
    const htmlPath = path.join(target.paths.source, target.html.template);
    return fs.pathExistsSync(htmlPath) ? htmlPath : this._generateHTML(target);
  }
  /**
   * This method generates a default HTML file template for a target, saves it on the temp
   * directory and returns its path.
   * This method emits two reducer events:
   * - `target-default-html-settings`: It receives the template settings as an object with the
   *  keys `title`, `bodyAttributes` and `bodyContents`; and the target information. It expects
   *  another settings object in return.
   * - `target-default-html`: It receives the HTML code for the file, the target information and
   *  it expects a new HTML code in return.
   * @param {Target} target The target information.
   * @return {string}
   * @throws {Error} If the file couldn't be saved on the temp directory.
   * @ignore
   * @access protected
   */
  _generateHTML(target) {
    // Reduce the settings for the template.
    const info = this.events.reduce(
      'target-default-html-settings',
      {
        title: target.name,
        bodyAttributes: '',
        bodyContents: '<div id="app"></div>',
      },
      target
    );
    // Normalize the body attributes to avoid unnecessary spaces on the tag.
    const bodyAttrs = info.bodyAttributes ? ` ${info.bodyAttributes}` : '';
    // Generate the HTML code.
    const htmlTpl = '<!doctype html>' +
    '<html lang="en">' +
    '<head>' +
    ' <meta charset="utf-8" />' +
    ' <meta http-equiv="x-ua-compatible" content="ie=edge" />' +
    ' <meta name="viewport" content="width=device-width, initial-scale=1" />' +
    ` <title>${info.title}</title>` +
    '</head>' +
    `<body${bodyAttrs}>` +
    ` ${info.bodyContents}` +
    '</body>' +
    '</html>';
    // Reduce the HTML code.
    const html = this.events.reduce('target-default-html', htmlTpl, target);
    // Write the file on the temp directory.
    return this.tempFiles.writeSync(`${target.name}.index.html`, html);
  }
}
/**
 * The service provider that once registered on the app container will create an instance of
 * `TargetsHTML` and set its `getHTMLFilepath` method as the `targetsHTML` service.
 * @example
 * // Register it on the container
 * container.register(targetsHTML);
 * // Getting access to the service function
 * const targetsHTML = container.get('targetsHTML');
 * @type {Provider}
 */
const targetsHTML = provider((app) => {
  app.set('targetsHTML', () => new TargetsHTML(
    app.get('events'),
    app.get('tempFiles')
  ).getHTMLFilepath);
});

module.exports = {
  TargetsHTML,
  targetsHTML,
};
