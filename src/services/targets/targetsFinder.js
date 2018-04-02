const fs = require('fs-extra');
const path = require('path');
const extend = require('extend');
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
      js: /\.jsx?$/i,
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
    };
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
      /(?:^|\s|=)(?:window|global)\s*\.(?:document?)/i,
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
      }
      // Define the entry to be analyzed in order to identify the target type.
      const entry = target.entry.production || target.entry.default;
      // Build the absolute path to the entry file.
      const entryPath = path.join(directory, entry);
      // If the file exists...
      if (fs.pathExistsSync(entryPath)) {
        // Merge the target structure created by this method with the results of the analysis.
        target = extend(true, {}, target, this._parseTargetEntry(entryPath));
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
    // Get the information of all the import statements.
    const importInfo = this._getFileImports(contents);
    // Get the information of all the export statements
    const exportInfo = this._getFileExports(contents);
    // If the target is exporting something, then it's a library.
    const library = exportInfo.items.length > 0;

    // Loop all the known browser frameworks.
    const framework = Object.keys(this._browserFrameworks)
    // Try to find an import statement that matches the browser framework regular expression.
    .find((name) => {
      const regex = this._browserFrameworks[name];
      return !!importInfo.items.find((file) => file.match(regex));
    });

    /**
     * Try to determine if the target type is `browser` by either checking if a browser framework
     * was found or by trying to find a known browser code.
     */
    let isBrowser = !!(
      framework || this._browserExpressions.find((regex) => contents.match(regex))
    );
    /**
     * Try to find a framework that can also be used on the Node, which will mean that if
     * `isBrowser` is `true`, is a false positive.
     */
    const nodeFramework = Object.keys(this._nodeFrameworks)
    .find((name) => {
      const regex = this._nodeFrameworks[name];
      return !!importInfo.items.find((file) => file.match(regex));
    });
    /**
     * If the target was marked as `browser`, but it uses a version of the framework that also runs
     * on Node, using SSR maybe, fix the false positive.
     */
    if (isBrowser && nodeFramework) {
      isBrowser = false;
    }

    // Define the basic properties of the return object.
    const info = {
      type: isBrowser ? 'browser' : 'node',
      library,
    };

    // If a browser framework was found...
    if (framework) {
      // ...set it as the framework property.
      info.framework = framework;
    } else if (!isBrowser) {
      /**
       * ...otherwise, it means that the target type can be `node`, so validate if the target needs
       * bundling or transpilation.
       *
       * Loop all the import statements and check if the file is importing an asset file type (
       * images, fonts, stylesheets, etc.).
       */
      const importingAssets = importInfo.items.find((file) => file.match(this._extensions.asset));
      // If the file is importing an asset, turn the `bundle` flag to `true`.
      if (importingAssets) {
        info.bundle = true;
      } else if (importInfo.from.includes('next') || exportInfo.from.includes('next')) {
        /**
         * If the target is using `import` or `export` but is not importing assets, then turn
         * the `transpile` flag to true.
         */
        info.transpile = true;
      }
    }
    /**
     * If the target is a library for the browser, change the output so it won't be adding hashes
     * to the bundled filename nor saving it on a sub directory.
     */
    if (isBrowser && info.library) {
      info.output = {
        default: {
          js: '[target-name].js',
        },
        development: {
          js: '[target-name].js',
        },
      };
    }
    // Return the result of the analysis.
    return info;
  }
  /**
   * Get the information of all the export statements from a given code.
   * @param  {string} contents The code from where to extract the statements.
   * @return {Object}
   * @property {Array} from  The names of the lists that matched the statements. This can be used
   *                         to identify the type of statement syntax the code uses.
   * @property {Array} items The matched statements.
   * @ignore
   * @access protected
   */
  _getFileExports(contents) {
    return this._extractFromCode(contents, this._exports);
  }
  /**
   * Get the information of all the import statements from a given code.
   * @param  {string} contents The code from where to extract the statements.
   * @return {Object}
   * @property {Array} from  The names of the lists that matched the statements. This can be used
   *                         to identify the type of statement syntax the code uses.
   * @property {Array} items The matched statements.
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
   * @return {Object}
   * @property {Array} from  The keys of the lists that found results.
   * @property {Array} items The matched results from the expressions.
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
          // If it's not on the list, add it.
          if (!items.includes(normalized)) {
            items.push(normalized);
          }
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
