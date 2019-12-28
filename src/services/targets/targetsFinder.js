const fs = require('fs-extra');
const path = require('path');
const ObjectUtils = require('wootils/shared/objectUtils');
const { provider } = require('jimple');
/**
 * This is used to find targets information on an specific directory. It not only reads the
 * directory tree but also tries to identify the targets types by analyzing the contents of
 * indentified targets entry files.
 */
class TargetsFinder {
  /**
   * Class constructor.
   * @param {Object}    packageInfo If there's only one target and is not on a sub folder, the way
   *                                the service names it is by using the project name that's on the
   *                                `package.json`.
   * @param {PathUtils} pathUtils   To build the path to the directory that will be read.
   * @ignore
   */
  constructor(packageInfo, pathUtils) {
    /**
     * The contents of the project `package.json`. If there's only one target and is not on a sub
     * folder, the way the service names it is by using the project name.
     * @type {Object}
     */
    this.packageInfo = packageInfo;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A list of items that should be ignored when reading a directory.
     * @type {Array}
     * @ignore
     * @access protected
     */
    this._ignoredItems = ['.', '..', 'thumbs.db', '.ds_store'];
    /**
     * A dictionary of known file types and regular expressions that match their extensions.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._extensions = {
      js: /\.[jt]sx?$/i,
      typeScript: /\.tsx?$/i,
      typeScriptReact: /\.tsx$/i,
      asset: /\.(png|jpe?g|gif|s?css|html|svg|woff2?|ttf|eot)$/i,
    };
    /**
     * A dictionary of _"import methods"_ a file can use. They're separated in two categories:
     * 'native' and 'next', so the service can identify if a Node target requires bundling or not.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._imports = {
      native: [
        /\s*require\s*\(\s*['|"](.*?)['|"]\s*\)/ig,
      ],
      next: [
        /\s*from\s*['|"](.*?)['|"]/ig,
        /\s*import\s*\(\s*['|"](.*?)['|"]\s*\)/ig,
      ],
    };
    /**
     * A dictionary of _"export methods"_ a file can use. They're separated in two categories:
     * 'native' and 'next', so the service can identify if a Node target requires bundling or not.
     * If a target entry file implements any kind of _"export method"_, it will be marked as a
     * library target.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._exports = {
      native: [/(?:^|\s)(module\.exports\s*=)/ig],
      next: [/(?:^|\s)(export(?: default)?\s*(?:.*?))/ig],
    };
    /**
     * A dictionary of known browser frameworks and regular expressions that match their module
     * name.
     * @type {Object}
     * @ignore
     * @access protected
     */
    this._browserFrameworks = {
      angular: /@angular(?:\/(?:\w+))?$/i,
      angularjs: /angular/i,
      react: /react(?:(?!(?:-dom\/server)))/i,
      aurelia: /aurelia/i,
    };
    /**
     * A list of known browser frameworks that need to export something on the entry point in order
     * to work. This is list is used to prevent the service from thinking an app is a library.
     * @type {Array}
     * @ignore
     * @access protected
     */
    this._browserFrameworksWithExports = ['aurelia'];
    /**
     * A dictionary of known frameworks that can be used on Node, and regular expressions that
     * match their module name.
     * @type {Object}
     */
    this._nodeFrameworks = {
      react: /react-dom\/server/i,
    };
    /**
     * A list of regular expressions that would only match code present on a browser target.
     * @type {Array}
     * @ignore
     * @access protected
     */
    this._browserExpressions = [
      /(?:^|\s|=)doc(?:ument?)\s*\.\s*(?:getElementBy(?:Id|ClassName)|querySelector(?:All)?)\s*\(/ig,
      /(?:^|\s|=)(?:window|global)\s*\.(?:document)?/i,
      /['|"]whatwg-fetch['|"]/i,
    ];
    /**
     * @ignore
     */
    this.find = this.find.bind(this);
  }
  /**
   * Given a directory path relative to the project root, this method will try to identify
   * targets and their properties.
   * @param {string} directory A directory path relative to the project root.
   * @return {Array} Each item will be a {@link TargetsFinderTarget}.
   */
  find(directory) {
    // Build the full path.
    const dirpath = this.pathUtils.join(directory);
    // Define the list that will be returned.
    const targets = [];
    // If the directory exists...
    if (fs.pathExistsSync(dirpath)) {
      // ...get all the items inside it.
      const items = this._getItems(dirpath);
      /**
       * Check if there's a JS file inside, which means that the directory is a target itself and
       * that it doesn't contain _"sub targets"_.
       */
      const jsFile = items.find((item) => item.name.match(this._extensions.js));
      // If there's a JS file...
      if (jsFile) {
        // ...try to parse a target on that directory.
        const target = this._parseTarget(this.packageInfo.name, dirpath, false);
        // If there was a target in there, add it to the list.
        if (target) {
          targets.push(target);
        }
      } else {
        // ...otherwise, loop all the items on the directory.
        items.forEach((item) => {
          // If the item is a directory...
          if (item.stats.isDirectory()) {
            // ...try to parse a target on that directory.
            const target = this._parseTarget(item.name, item.path);
            // If there was a target in there, add it to the list.
            if (target) {
              targets.push(target);
            }
          }
        });
      }
    }
    // Return the list of found targets.
    return targets;
  }
  /**
   * Get all the items on a given path.
   * @param {string} directoryPath The path to the directory to read.
   * @return {Array} A list of {@link TargetsFinderItem}.
   * @ignore
   * @access protected
   */
  _getItems(directoryPath) {
    // Read the directory.
    return fs.readdirSync(directoryPath)
    // Filter the ignored items.
    .filter((item) => !this._ignoredItems.includes(item.toLowerCase()))
    // For each found item, build its full path, get its stats and return it on an object.
    .map((item) => {
      const filepath = path.join(directoryPath, item);
      const stats = fs.lstatSync(filepath);
      return {
        name: item,
        path: filepath,
        stats,
      };
    });
  }
  /**
   * This method tries to get a target information from a given directory.
   * @param {string}  name             The name of the target.
   * @param {string}  directory        The absolute path to the directory to parse.
   * @param {boolean} [hasFolder=true] The value of the target `hasFolder` and `createFolder`
   *                                   properties.
   * @return {?TargetsFinderTarget} If the target can't be identified because there's no JS files
   *                                or a valid entry file can't be found, the method will return
   *                                `null`.
   * @ignore
   * @access protected
   */
  _parseTarget(name, directory, hasFolder = true) {
    // Define the base structure of the target data this method can handle.
    let target = {
      name,
      hasFolder,
      createFolder: hasFolder,
      entry: {
        default: 'index.js',
        development: null,
        production: null,
      },
    };
    /**
     * Define a dictionary that will contain all the found JS files on the directory. The keys
     * will be the name of the files without extension and the values will be the real name of the
     * file.
     * This way it makes it easier to test using the key as _"falsy value"_ without having to call
     * `includes`.
     */
    const jsFiles = {};
    // Get all the items on the directory.
    this._getItems(directory)
    // Filter the JS files.
    .filter((item) => item.name.match(this._extensions.js))
    // Add them to the dictionary.
    .forEach((item) => {
      const itemName = item.name.replace(this._extensions.js, '').toLowerCase();
      jsFiles[itemName] = item.name;
    });

    // Get all extension-less names on a list (because we need the `length`).
    const jsFilesNames = Object.keys(jsFiles);
    // Only process the target if there are JS files on the directory.
    if (jsFilesNames.length) {
      // If there's only one JS file...
      if (jsFilesNames.length === 1) {
        // ...set it as the default entry file.
        const [defaultJSFile] = jsFilesNames;
        target.entry.default = jsFiles[defaultJSFile];
      } else {
        // If there's a development entry file, set it.
        if (jsFiles['index.development']) {
          target.entry.development = jsFiles['index.development'];
        }
        // If there's a production entry file, set it.
        if (jsFiles['index.production']) {
          target.entry.production = jsFiles['index.production'];
        }
        // If there's a index, set it as the default.
        if (jsFiles.index) {
          target.entry.default = jsFiles.index;
        }
      }
      // Define the entry to be analyzed in order to identify the target type.
      const entry = target.entry.production || target.entry.default;
      // Build the absolute path to the entry file.
      const entryPath = path.join(directory, entry);
      // If the file exists...
      if (fs.pathExistsSync(entryPath)) {
        // Merge the target structure created by this method with the results of the analysis.
        target = ObjectUtils.merge(target, this._parseTargetEntry(entryPath));
      }
    }
    /**
     * If there's a type, which means that there was at least one JS file and a valid entry file,
     * return the target, otherwise return `null`.
     */
    return target.type ? target : null;
  }
  /**
   * Parse a target entry file and try to identify the target type, if it's a library and if it
   * requires bundling.
   * @param {string} entryPath The absolute path to the target entry file.
   * @return {Object}
   * @property {string}   type      The target type: `node` or `browser`.
   * @property {boolean}  library   Whether the target is a library or not.
   * @property {?string}  framework If the target type is `browser` and a framework was identified,
   *                                this property will have the name of the framework.
   * @property {?boolean} transpile If the target type is `node`, this flag will indicate if the
   *                                method identified syntax not yet supported by Node.
   * @ignore
   * @access protected
   */
  _parseTargetEntry(entryPath) {
    // Get the contents of the file.
    const contents = fs.readFileSync(entryPath, 'utf-8');
    // Try to find information from the `@projext` comment.
    const comments = this._findSettingsComment(contents);
    // Get the information of all the import statements.
    const importInfo = this._getFileImports(contents);
    // Get the information of all the export statements
    const exportInfo = this._getFileExports(contents);
    // Try to find a browser framework
    const framework = this._findBrowserFramework(comments, importInfo);
    // Detect whether the target is a library or not.
    const library = this._isLibrary(comments, exportInfo, framework);
    // Try to find a framework that can also be used on Node.
    const nodeFramework = this._findNodeFramework(importInfo);
    /**
     * Try to determine if the target type is `browser` by either checking if a browser framework
     * was found or by trying to find a known browser code.
     */
    const isBrowser = !nodeFramework && this._isABrowserTarget(comments, contents, framework);
    // Define the basic properties of the return object.
    let info = {
      type: isBrowser ? 'browser' : 'node',
      library,
    };
    // If a browser framework was found...
    if (framework) {
      // ...set it as the framework property.
      info.framework = framework;
    } else if (!isBrowser) {
      // .. so the target is for Node; check if it needs bundling or transpilation.
      if (this._needsBundling(importInfo)) {
        info.bundle = true;
      } else if (this._needsTranspilation(importInfo, exportInfo)) {
        /**
         * If the target is using `import` or `export` but is not importing assets, then turn
         * the `transpile` flag to true.
         */
        info.transpile = true;
      }
    }
    /**
     * If the target is a library, normalize the output so it won't add sub directories nor hashes.
     * A library path is usually set on the `package.json` as the `main` setting, so the path
     * shouldn't be dynamic.
     */
    if (info.library) {
      info.output = {
        default: {
          js: '[target-name].js',
        },
        development: {
          js: '[target-name].js',
        },
      };
    }
    // If the target uses TypeScript or Flow, add the necessary settings for it.
    if (entryPath.match(this._extensions.typeScript)) {
      info = Object.assign({}, info, this._getTypescriptSettings(
        !isBrowser,
        info.bundle,
        entryPath,
        framework
      ));
    } else if (comments.flow) {
      info = Object.assign({}, info, this._getFlowSettings(!isBrowser, info.bundle));
    }
    // Return the result of the analysis.
    return info;
  }
  /**
   * Tries to find a browser framework from an entry file comments or by its import statements.
   * @param {Object}                          comments          The dictionary of comments
   *                                                            extracted from the file.
   * @param {TargetsFinderExtractInformation} importInformation The information of the file import
   *                                                            statements.
   * @return {?String}
   * @access protected
   * @ignore
   */
  _findBrowserFramework(comments, importInformation) {
    // Loop all the known browser frameworks.
    const result = comments.framework || Object.keys(this._browserFrameworks)
    // Try to find an import statement that matches the browser framework regular expression.
    .find((name) => {
      const regex = this._browserFrameworks[name];
      return !!importInformation.items.find((file) => file.match(regex));
    });

    return result || null;
  }
  /**
   * Tries to find a Node framework from an entry file import statements.
   * @param {TargetsFinderExtractInformation} importInformation The information of the file import
   *                                                            statements.
   * @return {?String}
   * @access protected
   * @ignore
   */
  _findNodeFramework(importInformation) {
    const result = Object.keys(this._nodeFrameworks)
    .find((name) => {
      const regex = this._nodeFrameworks[name];
      return !!importInformation.items.find((file) => file.match(regex));
    });

    return result || null;
  }
  /**
   * Checks if a target should be a library or not based on its entry file comments, export
   * statements information and/or the framework it uses.
   * @param {Object}                          comments          The dictionary of comments
   *                                                            extracted from the file.
   * @param {TargetsFinderExtractInformation} exportInformation The information of the file export
   *                                                            statements.
   * @param {?String}                         framework         The name of a framework the target
   *                                                            uses.
   * @return {Boolean}
   * @access protected
   * @ignore
   */
  _isLibrary(comments, exportInformation, framework) {
    // If the comment says it's a library, then it's a library.
    return comments.library || (
      /**
       * If there's no comment, check if the framework doesn't require exports (like Aurelia),
       * and that there are actual export statements.
       */
      (framework === null || !this._browserFrameworksWithExports.includes(framework)) &&
      exportInformation.items.length > 0
    );
  }
  /**
   * Checks if a target type is `browser` based on its entry file comments, contents and/or
   * the framework it uses.
   *
   * @param {Object}  comments  The dictionary of comments extracted from the file.
   * @param {String}  contents  The contents of the file.
   * @param {?String} framework The name of a framework the target uses.
   * @return {Boolean}
   * @access protected
   * @ignore
   */
  _isABrowserTarget(comments, contents, framework) {
    // If the comment says it's for browser, then it's for browser.
    return comments.type === 'browser' || (
      /**
       * If there's no comment, check if the target doesn't use a known browser framework or if
       * its content have code that can be recognized as browser-only code.
       */
      framework !== null ||
      this._browserExpressions.find((expression) => contents.match(expression))
    );
  }
  /**
   * Checks if a Node target needs bundling by trying to find an import statement for an asset
   * (like an image file).
   * @param {TargetsFinderExtractInformation} importInformation The information of the file import
   *                                                            statements.
   * @return {Boolean}
   * @access protected
   * @ignore
   */
  _needsBundling(importInformation) {
    return importInformation.items.find((file) => file.match(this._extensions.asset));
  }
  /**
   * Checks if a Node target needs transpilation by trying to find import or export statements
   * that use ESModules.
   * @param {TargetsFinderExtractInformation} importInformation The information of the file import
   *                                                            statements.
   * @param {TargetsFinderExtractInformation} exportInformation The information of the file export
   *                                                            statements.
   * @return {Boolean}
   * @access protected
   * @ignore
   */
  _needsTranspilation(importInformation, exportInformation) {
    return importInformation.from.includes('next') || exportInformation.from.includes('next');
  }
  /**
   * Gets the necessary settings for a target to use TypeScript.
   * @param {Boolean} isANodeTarget Whether or not the target is for Node.
   * @param {Boolean} needsBundling Whether or not the target needs bundling.
   * @param {String}  entryPath     The path of the target entry file.
   * @param {?String} framework     The name of a framework the target uses.
   * @return {Object}
   * @property {Boolean} [typeScript=true]
   * The flag that indicates the target uses TypeScript.
   * @property {ProjectConfigurationTargetTemplateSourceMapSettings} [sourceMap]
   * The settings for source maps all set to `true` as they are needed for the types.
   * @property {?String} [framework]
   * If the method detects a `.tsx` extension, it will add this property with `react` as value.
   * @property {?Boolean} [transpile=true]
   * If the target is for Node and doesn't need bundling, then it needs at least transpilation in
   * order to use TypeScript.
   * @access protected
   * @ignore
   */
  _getTypescriptSettings(isANodeTarget, needsBundling, entryPath, framework) {
    const settings = {
      typeScript: true,
      sourceMap: {
        development: true,
        production: true,
      },
    };

    if (isANodeTarget && !needsBundling) {
      settings.transpile = true;
    }

    if (framework === null && entryPath.match(this._extensions.typeScriptReact)) {
      settings.framework = 'react';
    }

    return settings;
  }
  /**
   * Gets the necessary settings for a target to use Flow.
   * @param {Boolean} isANodeTarget Whether or not the target is for Node.
   * @param {Boolean} needsBundling Whether or not the target needs bundling.
   * @return {Object}
   * @property {Boolean} [flow=true]
   * The flag that indicates the target uses TypeScript.
   * @property {?Boolean} [transpile=true]
   * If the target is for Node and doesn't need bundling, then it needs at least transpilation in
   * order to use TypeScript.
   * @access protected
   * @ignore
   */
  _getFlowSettings(isANodeTarget, needsBundling) {
    const settings = {
      flow: true,
    };

    if (isANodeTarget && !needsBundling) {
      settings.transpile = true;
    }

    return settings;
  }
  /**
   * This method tries to find and parse settings on a "@projext comment" inside a target entry
   * file.
   * @param {String} contents The contents of the target entry file.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _findSettingsComment(contents) {
    let result;
    const match = /\/\*\*\n\s*\*\s*@projext\n([\s\S]*?)\n\s*\*\//.exec(contents);
    if (match) {
      const [, lines] = match;
      result = lines
      .split('\n')
      .map((line) => {
        let newLine;
        const lineMatch = /\s*\*\s*(\w+)\s*:\s*(.*?)$/.exec(line);
        if (lineMatch) {
          const [, name, value] = lineMatch;
          newLine = { name, value };
        } else {
          newLine = null;
        }

        return newLine;
      })
      .filter((line) => line !== null)
      .reduce(
        (acc, line) => {
          let useValue;
          if (['true', 'false'].includes(line.value)) {
            useValue = line.value === 'true';
          } else {
            useValue = line.value;
          }

          return Object.assign({}, acc, {
            [line.name]: useValue,
          });
        },
        {}
      );
    } else {
      result = {};
    }

    return result;
  }
  /**
   * Get the information of all the export statements from a given code.
   * @param  {string} contents The code from where to extract the statements.
   * @return {TargetsFinderExtractInformation}
   * @ignore
   * @access protected
   */
  _getFileExports(contents) {
    return this._extractFromCode(contents, this._exports);
  }
  /**
   * Get the information of all the import statements from a given code.
   * @param  {string} contents The code from where to extract the statements.
   * @return {TargetsFinderExtractInformation}
   * @ignore
   * @access protected
   */
  _getFileImports(contents) {
    return this._extractFromCode(contents, this._imports);
  }
  /**
   * Given a dictionary of regular expressions lists and a source code, this method will try to
   * identify and match the expressions in order to return all the matched results and the keys
   * of the lists that returned results.
   * @example
   * const dictionary = {
   *   listOne: [/(goodbye)/ig, /(Batman)/ig],
   *   listTwo: [/(hello)/ig, /(Nightwing)/ig],
   * };
   * const code = 'hello Batman';
   * console.log(this._extractFromCode(code, dictionary));
   * // This would output { from: ['listOne', 'listTwo'], items: ['hello', 'Batman'] }
   *
   * @param {string} contents              The source code to parse.
   * @param {Object} expressionsDictionary A dictionary of regular expressions lists.
   * @return {TargetsFinderExtractInformation}
   * @throws {Error} if a regular expression doesn't have a capturing group.
   * @ignore
   * @access protected
   */
  _extractFromCode(contents, expressionsDictionary) {
    // Setup the return object and its properties.
    const result = {
      from: [],
      items: [],
    };
    // Loop all the dictionaries.
    Object.keys(expressionsDictionary).forEach((dictionaryName) => {
      // Get the list of expressions.
      const expressions = expressionsDictionary[dictionaryName];
      // Set a list to hold all the found results of the current directionary.
      const items = [];
      // Loop all the expressions.
      expressions.forEach((regex) => {
        // Execute the expression.
        let match = regex.exec(contents);
        while (match) {
          // Get the first capturing group.
          const [, extract] = match;
          // Normalize the extracted text.
          const normalized = extract.toLowerCase().trim();
          // Add it to the list.
          items.push(normalized);
          // Continue the execution loop.
          match = regex.exec(contents);
        }
      });
      // If the current dictionary found results...
      if (items.length) {
        // Add the dictionary name to the return object.
        result.from.push(dictionaryName);
        // Add the found items to the return object.
        result.items.push(...items);
      }
    });

    return result;
  }
}
/**
 * The service provider that once registered on the app container will create an instance of
 * `TargetsFinder` and set its `find` method as the `targetsFinder` service.
 * @example
 * // Register it on the container
 * container.register(targetsFinder);
 * // Getting access to the service function
 * const targetsFinder = container.get('targetsFinder');
 * @type {Provider}
 */
const targetsFinder = provider((app) => {
  app.set('targetsFinder', () => new TargetsFinder(
    app.get('packageInfo'),
    app.get('pathUtils')
  ).find);
});

module.exports = {
  TargetsFinder,
  targetsFinder,
};
