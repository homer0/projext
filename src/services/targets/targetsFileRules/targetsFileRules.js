const { provider } = require('jimple');
const TargetFileRule = require('./targetFileRule');
/**
 * This service is intended as a helper for plugins or build engines that need to find targets
 * files by creating a set of _"rules"_ for the basic type of files projext manages: JS, SCSS,
 * CSS, fonts, images and favicons.
 */
class TargetsFileRules {
  /**
   * @param {Events}    events    To send to {@link TargetFileRule} and to inform when rules are
   *                              created.
   * @param {PathUtils} pathUtils To build the path to the configuration directory, in order to
   *                              add it on the JS rule.
   * @param {Targets}   targets   To get a target information when a set of rules is generated.
   */
  constructor(events, pathUtils, targets) {
    /**
     * A local reference for the `events` service.
     * @type {Events}
     */
    this.events = events;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
  }
  /**
   * Get a set of file rules for an specific target.
   * @param {string|Target} target The target information or its name.
   * @return {TargetFilesRules}
   */
  getRulesForTarget(target) {
    // If the received `target` is a `string`, get its info.
    const targetInfo = typeof target === 'string' ?
      this.targets.getTarget(target) :
      target;

    // Define the rules.
    const rules = {
      js: this._getJSRule(targetInfo),
      scss: this._getSCSSRule(targetInfo),
      css: this._getCSSRule(targetInfo),
      fonts: {
        common: this._getCommonFontsRule(targetInfo),
        svg: this._getSVGFontsRule(targetInfo),
      },
      images: this._getImagesRule(targetInfo),
      favicon: this._getFaviconRule(targetInfo),
    };

    // Emit the event informing the rule has been created.
    this.events.emit('target-file-rules', rules, targetInfo);
    // Return teh rules.
    return rules;
  }
  /**
   * Creates the rule object for a target JS files.
   * @param {Target} target The target information.
   * @return {TargetFileRule}
   * @access protected
   * @ignore
   */
  _getJSRule(target) {
    const rule = new TargetFileRule(this.events, this.targets, 'js', (ruleTarget, hasTarget) => {
      const pathsInclude = [];
      const filesInclude = [];
      const filesGlobInclude = [];
      /**
       * If this is the first time a target is being added to the rule, add the configuration
       * directory path to the lists of allowed paths.
       */
      if (!hasTarget) {
        // Get the configuration directory path.
        const config = this.pathUtils.join('config');
        // Push it to the list of paths.
        pathsInclude.push(new RegExp(config, 'i'));
        // Push it to the lists of files.
        filesInclude.push(new RegExp(`${config}/.*?\\.[jt]sx?$`, 'i'));
        filesGlobInclude.push(`${config}/**/*.{js,jsx,ts,tsx}`);
      }
      // Define the allowed paths.
      pathsInclude.push(...[
        // The target path.
        new RegExp(ruleTarget.paths.source, 'i'),
        // The paths for modules that have been explicity included on the target settings.
        ...ruleTarget.includeModules.map((modName) => (
          new RegExp(`node_modules/${modName}`)
        )),
      ]);
      // Define the allowed file paths.
      filesInclude.push(...[
        // Target files.
        new RegExp(`${ruleTarget.paths.source}/.*?\\.[jt]sx?$`, 'i'),
        // Files of modules that have been explicity included on the target settings.
        ...ruleTarget.includeModules.map((modName) => (
          new RegExp(`node_modules/${modName}/.*?\\.[jt]sx?$`, 'i')
        )),
      ]);
      // Define the allowed file paths, on glob format.
      filesGlobInclude.push(...[
        // Target files.
        `${ruleTarget.paths.source}/**/*.{js,jsx,ts,tsx}`,
        // Files of modules that have been explicity included on the target settings.
        ...ruleTarget.includeModules.map((modName) => (
          `node_modules/${modName}/**/*.{js,jsx,ts,tsx}`
        )),
      ]);
      // Return the rule settings.
      return {
        extension: /\.[jt]sx?$/i,
        glob: '**/*.{js,jsx,ts,tsx}',
        paths: {
          include: pathsInclude,
          exclude: [],
        },
        files: {
          include: filesInclude,
          exclude: [],
          glob: {
            include: filesGlobInclude,
            exclude: [],
          },
        },
      };
    });
    // Add the target to the rule.
    rule.addTarget(target);
    // Emit the event informing the rule has been created.
    this.events.emit('target-js-files-rule', rule, target);
    // Return the rule.
    return rule;
  }
  /**
   * Creates the rule object for a target SCSS files.
   * @param {Target} target The target information.
   * @return {TargetFileRule}
   * @access protected
   * @ignore
   */
  _getSCSSRule(target) {
    const rule = new TargetFileRule(this.events, this.targets, 'scss', (ruleTarget) => ({
      extension: /\.scss$/i,
      glob: '**/*.scss',
      paths: {
        // Define the allowed paths.
        include: [
          // The target path.
          new RegExp(ruleTarget.paths.source, 'i'),
          // The paths for modules that have been explicity included on the target settings.
          ...ruleTarget.includeModules.map((modName) => (
            new RegExp(`node_modules/${modName}`)
          )),
        ],
        exclude: [],
      },
      files: {
        // Define the allowed file paths.
        include: [
          // Target files.
          new RegExp(`${ruleTarget.paths.source}/.*?\\.scss$`, 'i'),
          // Files of modules that have been explicity included on the target settings.
          ...ruleTarget.includeModules.map((modName) => (
            new RegExp(`node_modules/${modName}/.*?\\.scss$`, 'i')
          )),
        ],
        exclude: [],
        glob: {
          // Define the allowed file paths, on glob format.
          include: [
            // Target files.
            `${ruleTarget.paths.source}/**/*.scss`,
            // Files of modules that have been explicity included on the target settings.
            ...ruleTarget.includeModules.map((modName) => (
              `node_modules/${modName}/**/*.scss`
            )),
          ],
          exclude: [],
        },
      },
    }));
    // Add the target to the rule.
    rule.addTarget(target);
    // Emit the event informing the rule has been created.
    this.events.emit('target-scss-files-rule', rule, target);
    // Return the rule.
    return rule;
  }
  /**
   * Creates the rule object for a target CSS files.
   * @param {Target} target The target information.
   * @return {TargetFileRule}
   * @access protected
   * @ignore
   */
  _getCSSRule(target) {
    const rule = new TargetFileRule(this.events, this.targets, 'css', (ruleTarget) => ({
      extension: /\.css$/i,
      glob: '**/*.css',
      paths: {
        // Define the allowed paths.
        include: [
          // The target path.
          new RegExp(ruleTarget.paths.source, 'i'),
          // Any path inside the `node_modules` directory.
          /node_modules\//i,
        ],
        exclude: [],
      },
      files: {
        // Define the allowed file paths.
        include: [
          // Target files.
          new RegExp(`${ruleTarget.paths.source}/.*?\\.css$`, 'i'),
          // Any file inside the `node_modules` directory.
          /node_modules\/.*?\.css$/i,
        ],
        exclude: [],
        glob: {
          // Define the allowed file paths, on glob format.
          include: [
            // Target files.
            `${ruleTarget.paths.source}/**/*.css`,
            // Any file inside the `node_modules` directory.
            'node_modules/**/*.css',
          ],
          exclude: [],
        },
      },
    }));
    // Add the target to the rule.
    rule.addTarget(target);
    // Emit the event informing the rule has been created.
    this.events.emit('target-css-files-rule', rule, target);
    // Return the rule.
    return rule;
  }
  /**
   * Creates the rule object for a target common font files. By _"common"_, it means that it
   * doesn't include `.svg` files; the reason is that have some very specific expressions so they
   * can be differentiated from images.
   * @param {Target} target The target information.
   * @return {TargetFileRule}
   * @access protected
   * @ignore
   */
  _getCommonFontsRule(target) {
    const rule = new TargetFileRule(this.events, this.targets, 'fonts.common', (ruleTarget) => ({
      extension: /\.(?:woff2?|ttf|eot)$/i,
      glob: '**/*.{woff,woff2,ttf,eot}',
      paths: {
        // Define the allowed paths.
        include: [
          // The target path.
          new RegExp(ruleTarget.paths.source, 'i'),
          // Any path inside the `node_modules` directory.
          /node_modules\//i,
        ],
        exclude: [],
      },
      files: {
        // Define the allowed file paths.
        include: [
          // Target files.
          new RegExp(`${ruleTarget.paths.source}/.*?\\.(?:woff2?|ttf|eot)`, 'i'),
          // Any file inside the `node_modules` directory.
          /node_modules\/.*?\.(?:woff2?|ttf|eot)$/i,
        ],
        exclude: [],
        glob: {
          // Define the allowed file paths, on glob format.
          include: [
            // Target files.
            `${ruleTarget.paths.source}/**/*.{woff,woff2,ttf,eot}`,
            // Any file inside the `node_modules` directory.
            'node_modules/**/*.{woff,woff2,ttf,eot}',
          ],
          exclude: [],
        },
      },
    }));
    // Add the target to the rule.
    rule.addTarget(target);
    // Emit the event informing the rule has been created.
    this.events.emit('target-common-font-files-rule', rule, target);
    // Return the rule.
    return rule;
  }
  /**
   * Creates the rule object for a target SVG font files. This is separated from the _"common"_
   * fonts because projext only recognizes `.svg` files as fonts when they are inside a `fonts`
   * directory.
   * @param {Target} target The target information.
   * @return {TargetFileRule}
   * @access protected
   * @ignore
   */
  _getSVGFontsRule(target) {
    const rule = new TargetFileRule(this.events, this.targets, 'fonts.svg', (ruleTarget) => ({
      extension: /\.svg$/i,
      glob: '**/*.svg',
      paths: {
        // Define the allowed paths.
        include: [
          // Any path inside the target directory that contains a `fonts` component.
          new RegExp(`${ruleTarget.paths.source}/(?:.*?/)?fonts(?:/.*?)?$`, 'i'),
          // Any path on the `node_modules` that contains a `fonts` component.
          /node_modules\/(?:.*?\/)?fonts(?:\/.*?)?$/i,
        ],
        exclude: [],
      },
      files: {
        // Define the allowed file paths.
        include: [
          // Any `.svg` inside a `fonts` directory, on the target directory or the `node_modules`.
          new RegExp(`${ruleTarget.paths.source}/(?:.*?/)?fonts/.*?\\.svg$`, 'i'),
          /node_modules\/(?:.*?\/)?fonts\/.*?\.svg$/i,
        ],
        exclude: [],
        glob: {
          // Define the allowed file paths, on glob format.
          include: [
            /**
             * Any `.svg` inside a `fonts` directory, on the target directory or the
             * `node_modules`.
             */
            `${ruleTarget.paths.source}/**/fonts/**/*.svg`,
            'node_modules/**/fonts/**/*.svg',
          ],
          exclude: [],
        },
      },
    }));
    // Add the target to the rule.
    rule.addTarget(target);
    // Emit the event informing the rule has been created.
    this.events.emit('target-svg-font-files-rule', rule, target);
    // Return the rule.
    return rule;
  }
  /**
   * Creates the rule object for a target image files.
   * @param {Target} target The target information.
   * @return {TargetFileRule}
   * @access protected
   * @ignore
   */
  _getImagesRule(target) {
    const rule = new TargetFileRule(this.events, this.targets, 'images', (ruleTarget) => {
      /**
       * Define the excluded paths.
       * The issue here is that the rule should pick `.svg` files as images, but not if they
       * are inside a `fonts` directory, that's why the path expressions also include extensions.
       * The same goes for favicons, it should pick `png` and `ico` files, but not if they are
       * called `favicon`.
       */
      const exclude = [
        // Any path for an `.svg` file inside a `fonts` directory.
        new RegExp(`${ruleTarget.paths.source}/(?:.*?/)?fonts/.*?\\.svg$`, 'i'),
        // Any path for a `favicon` file with extension `png` or `ico`.
        new RegExp(`${ruleTarget.paths.source}/.*?favicon\\.(png|ico)$`, 'i'),
        // Any path for an `.svg` file with a `fonts` component inside the `node_modules`.
        /node_modules\/(?:.*?\/)?fonts\/.*?\.svg$/i,
      ];

      return {
        extension: /\.(jpe?g|png|gif|svg)$/i,
        glob: '**/*.{jpg,jpeg,png,gif,svg}',
        paths: {
          // Define the allowed paths.
          include: [
            // The target path.
            new RegExp(ruleTarget.paths.source, 'i'),
            // Any path inside the `node_modules` directory.
            /node_modules\//i,
          ],
          // Exclude anything related to fonts.
          exclude,
        },
        files: {
          // Define the allowed file paths.
          include: [
            // Target files.
            new RegExp(`${ruleTarget.paths.source}/.*?\\.(?:jpe?g|png|gif|svg)`, 'i'),
            // Any file inside the `node_modules` directory.
            /node_modules\/.*?\.(?:jpe?g|png|gif|svg)$/i,
          ],
          // Exclude anything related to fonts.
          exclude,
          glob: {
            // Define the allowed file paths, on glob format.
            include: [
              // Target files.
              `${ruleTarget.paths.source}/**/*.{jpg,jpeg,png,gif,svg}`,
              // Any file inside the `node_modules` directory.
              'node_modules/**/*.{jpg,jpeg,png,gif,svg}',
            ],
            // Exclude anything related to fonts.
            exclude: [
              // Any path for an `.svg` file inside a `fonts` directory.
              `${ruleTarget.paths.source}/**/fonts/**/*.svg`,
              // Any path for a `favicon` file with extension `png` or `ico`.
              `${ruleTarget.paths.source}/**/favicon.{png,ico}`,
              // Any path for an `.svg` file with a `fonts` component inside the `node_modules`.
              'node_modules/**/fonts/**/*.svg',
            ],
          },
        },
      };
    });
    // Add the target to the rule.
    rule.addTarget(target);
    // Emit the event informing the rule has been created.
    this.events.emit('target-image-files-rule', rule, target);
    // Return the rule.
    return rule;
  }
  /**
   * Creates the rule object for a target favicon files.
   * @param {Target} target The target information.
   * @return {TargetFileRule}
   * @access protected
   * @ignore
   */
  _getFaviconRule(target) {
    const rule = new TargetFileRule(this.events, this.targets, 'favicon', (ruleTarget) => ({
      extension: /\.(png|ico)$/i,
      glob: '**/*.{png,ico}',
      paths: {
        // Define the allowed paths.
        include: [
          // The target path.
          new RegExp(ruleTarget.paths.source, 'i'),
        ],
        exclude: [],
      },
      files: {
        // Define the allowed file paths.
        include: [
          // Any file called `favicon` with the extension `png` or `ico`
          new RegExp(`${ruleTarget.paths.source}/.*?favicon\\.(png|ico)$`, 'i'),
        ],
        exclude: [],
        glob: {
          // Define the allowed file paths, on glob format.
          include: [
            // Any file called `favicon` with the extension `png` or `ico`
            `${ruleTarget.paths.source}/**/favicon.{png,ico}`,
          ],
          exclude: [],
        },
      },
    }));
    // Add the target to the rule.
    rule.addTarget(target);
    // Emit the event informing the rule has been created.
    this.events.emit('target-favicon-files-rule', rule, target);
    // Return the rule.
    return rule;
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `TargetsFileRules` as the `targetsFileRules` service.
 * @example
 * // Register it on the container
 * container.register(targetsFileRules);
 * // Getting access to the service instance
 * const targetsFileRules = container.get('targetsFileRules');
 * @type {Provider}
 */
const targetsFileRules = provider((app) => {
  app.set('targetsFileRules', () => new TargetsFileRules(
    app.get('events'),
    app.get('pathUtils'),
    app.get('targets')
  ));
});

module.exports = {
  TargetsFileRules,
  targetsFileRules,
};
