/**
 * ================================================================================================
 * Externals
 * ================================================================================================
 */

/**
 * @external {Jimple}
 * https://yarnpkg.com/en/package/jimple
 */

/**
 * @external {Nodemon}
 * https://github.com/remy/nodemon/blob/master/doc/requireable.md
 */

/**
 * @external {Command}
 * https://tj.github.io/commander.js/#Command
 */

/**
 * @external {Watchpack}
 * https://yarnpkg.com/en/package/watchpack
 */

/**
 * @external {AppConfiguration}
 * https://homer0.github.io/wootils/class/wootils/node/appConfiguration.js~AppConfiguration.html
 */

/**
 * @external {PathUtils}
 * https://homer0.github.io/wootils/class/wootils/node/pathUtils.js~PathUtils.html
 */

/**
 * @external {Logger}
 * https://homer0.github.io/wootils/class/wootils/node/logger.js~Logger.html
 */

/**
 * @external {EnvironmentUtils}
 * https://homer0.github.io/wootils/class/wootils/node/environmentUtils.js~EnvironmentUtils.html
 */

/**
 * @external {EventsHub}
 * https://homer0.github.io/wootils/class/wootils/shared/eventsHub.js~EventsHub.html
 */

/**
 * @external {ErrorHandler}
 * https://homer0.github.io/wootils/class/wootils/node/errorHandler.js~ErrorHandler.html
 */

/**
 * @external {RootRequire}
 * https://homer0.github.io/wootils/function/index.html#static-function-rootRequire
 */

/**
 * ================================================================================================
 * Project configuration > Targets > sub properties > Shared
 * ================================================================================================
 */

/**
 * @typedef {Object} TargetTypeCheck
 * @property {boolean} node
 * Whether the target type is `node` or not.
 * @property {boolean} browser
 * Whether the target type is `browser` or not.
 */

/**
 * @typedef {Object} TargetPaths
 * @property {string} source
 * The absolute path to the target source directory.
 * @property {string} build
 * The absolute path to the folder, inside the distribution directory, where the target will be
 * bundled/copied.
 */

/**
 * @typedef {Object} TargetFolders
 * @property {string} source
 * The relative path to the target source directory.
 * @property {string} build
 * The relative path to the folder, inside the distribution directory, where the target will be
 * bundled/copied.
 */

/**
 * ================================================================================================
 * Project configuration > Targets templates > Sub properties > Shared
 * ================================================================================================
 */

/**
 * @typedef {Object} ProjectConfigurationTargetTemplateEntry
 * @property {string} [default='index.js']
 * The target entry file for all types of build that don't have a specified entry.
 * @property {string} [development=null]
 * The target entry file on a development build. If `null`, it will fallback to the one specified
 * on `default`.
 * @property {string} [production=null]
 * The target entry file on a production build. If `null`, it will fallback to the one specified
 * on `default`.
 */

/**
 * @typedef {Object} ProjectConfigurationTargetTemplateOutputPaths
 * @property {string} [js]
 * The path to generated Javascript files on the distribution directory.
 *
 * The available placeholders are:
 * - `[target-name]`: The name of the target.
 * - `[hash]`: A random hash generated for cache busting.
 *
 * The default value is:
 * - For `node` targets, on all build types: `[target-name].js`.
 * - For `browser` targets:
 *   - `development`: `'statics/js/[target-name].js'`.
 *   - `production`: `'statics/js/[target-name].[hash].js'`.
 * @property {string} [css]
 * The path to generated stylesheets on the distribution directory.
 *
 * The available placeholders are:
 * - `[target-name]`: The name of the target.
 * - `[hash]`: A random hash generated for cache busting.
 *
 * The default value is, for both `node` and `browser` targets:
 * - `development`: `'statics/styles/[target-name].css'`.
 * - `production`: `'statics/styles/[target-name].[hash].css'`.
 * @property {string} [fonts]
 * The path to font files once they are copied to the distribution directory.
 *
 * The available placeholders are:
 * - `[target-name]`: The name of the target.
 * - `[name]`: The file original name.
 * - `[ext]`: The file original extension.
 * - `[hash]`: A random hash generated for cache busting.
 *
 * The default value is, for both `node` and `browser` targets:
 * - `development`: `'statics/fonts/[name]/[name][ext]'`.
 * - `production`: `'statics/fonts/[name]/[name].[hash].[ext]'`.
 * @property {string} [fonts]
 * The path to image files once they are copied to the distribution directory.
 *
 * The available placeholders are:
 * - `[target-name]`: The name of the target.
 * - `[name]`: The file original name.
 * - `[ext]`: The file original extension.
 * - `[hash]`: A random hash generated for cache busting.
 *
 * The default value is, for both `node` and `browser` targets:
 * - `development`: `'statics/images/[name][ext]'`.
 * - `production`: `'statics/images/[name].[hash].[ext]'`.
 */

/**
 * @typedef {Object} ProjectConfigurationTargetTemplateOutput
 * @property {ProjectConfigurationTargetTemplateOutputPaths} [default]
 * The target output settings for all types of build that don't have specified settings.
 * @property {ProjectConfigurationTargetTemplateOutputPaths} [development]
 * The target output settings on a development build. If `null`, it will fallback to the ones
 * specified on `default`.
 * @property {ProjectConfigurationTargetTemplateOutputPaths} [production]
 * The target output settings on a production build. If `null`, it will fallback to the ones
 * specified on `default`.
 */

/**
 * ================================================================================================
 * Project configuration > Targets templates > Sub properties > Node
 * ================================================================================================
 */

/**
 * @typedef {Object} ProjectConfigurationNodeTargetTemplateBabelSettings
 * @property {Array} [features=[]]
 * projext includes by default two Babel plugins: `transform-class-properties` and
 * `transform-decorators-legacy`. On this list you can use the values `properties` or `decorators`
 * to include them.
 * If you need other plugins, they can be included on the `overwrites` option.
 * @property {string} [nodeVersion='current']
 * When building the Babel configuration, projext uses the `babel-preset-env` to just include the
 * necessary stuff. This setting tells the preset the version of Node it should _"complete"_.
 * @property {Object} [overwrites={}]
 * If you know how to use Babel and need stuff that is not covered by projext, you can use this
 * setting to overwrite/add any value you may need.
 */

/**
 * @typedef {Object} ProjectConfigurationNodeTargetTemplateLibraryOptions
 * @property {string} [libraryTarget='commonjs2']
 * How the library will be exposed: `commonjs2` or `umd`.
 */

/**
 * @typedef {Object} ProjectConfigurationNodeTargetTemplateCSSSettings
 * @property {boolean} [modules=false]
 * Whether or not your application uses CSS Modules. If this is enabled, all your styles will be
 * prefixed with a unique identifier.
 */

/**
 * ================================================================================================
 * Project configuration > Targets templates > Sub properties > Browser
 * ================================================================================================
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateSourceMapSettings
 * @property {boolean} [development=false]
 * Whether or not to generate a source map on a development build.
 * @property {boolean} [production=true]
 * Whether or not to generate a source map on a production build.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateHTMLSettings
 * @property {string} [default='index.html']
 * This setting can be used to set the same value of default `template` and `filename` at once. But
 * it will only overwrite settings with a `null` value, if one is specified, the value of this
 * setting will be ignored.
 * @property {string} [template=null]
 * The file inside your target source that will be used to generate the `html`. If `null`, it will
 * fallback to the value of the `default` setting.
 * @property {string} [filename=null]
 * The file that will be generated when your target is bundled. It will automatically include
 * the `<script />` tag to the generated bundle. If `null`, it will fallback to the value of the
 * `default` setting.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateCSSSettings
 * @property {boolean} [modules=false]
 * Whether or not your application uses CSS Modules. If this is enabled, all your styles will be
 * prefixed with a unique identifier.
 * @property {boolean} [inject=false]
 * If this setting is set to `true`, instead of generating a CSS file with your styles, they'll be
 * dynamically injected on HTML when the bundle gets executed.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateBabelSettings
 * @property {Array} [features=[]]
 * projext includes by default two Babel plugins: `transform-class-properties` and
 * `transform-decorators-legacy`. On this list you can use the values `properties` or `decorators`
 * to include them.
 * If you need other plugins, they can be included on the `overwrites` option.
 * @property {number} [browserVersions=2]
 * When building the Babel configuration, projext uses the `babel-preset-env` to just include the
 * necessary stuff. This setting tells how many old versions of the major browsers the target needs
 * transpilation for.
 * Major browsers: Firefox, Chrome, Safari and Edge.
 * @property {boolean} [mobileSupport=true]
 * If `true`, the configuration will add to the list of major browsers `iOS` and `Android`.
 * @property {boolean} [polyfill=true]
 * Whether or not the configuration should include the `babel-polyfill` package.
 * @property {Object} [overwrites={}]
 * If you know how to use Babel and need stuff that is not covered by projext, you can use this
 * setting to overwrite/add any value you may need.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateDevServerSSLSettings
 * @property {string} [key=null]
 * The path to the SSL key (`.key`).
 * @property {string} [cert=null]
 * The path to the SSL certificate (`.crt`).
 * @property {string} [ca=null]
 * The path to the SSL public file (`.pem`).
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateDevServerProxiedSettings
 * @property {boolean} [enabled=false]
 * Whether or not the dev server is being proxied.
 * @property {?string} [host=null]
 * The host used to proxy the dev server. If `null`, it will use the host defined on the dev server
 * main settings.
 * @property {?boolean} [https=null]
 * Whether or not the proxied host uses `https`. If `null` and you have provided SSL certificates
 * for the server, it will become `true`, otherwise it will be `false`.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateDevServerSettings
 * @property {number} [port=2509]
 * The server port.
 * @property {boolean} [reload=true]
 * Whether or not to reload the server when the code changes.
 * @property {string} [host='localhost']
 * The dev server hostname.
 * @property {ProjectConfigurationBrowserTargetTemplateDevServerSSLSettings} [ssl]
 * The paths to the files to enable SSL on the dev server.
 * @property {ProjectConfigurationBrowserTargetTemplateDevServerProxiedSettings} [proxied]
 * When the dev server is being proxied (using `nginx` for example), there are certain
 * functionalities, like hot module replacement and live reload that need to be aware of this.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateConfigurationSettings
 * @property {boolean} [enabled=false]
 * Whether or not the feature is enabled.
 * @property {null|Object} [default=null]
 * The default configuration. If none is specified, when the target is builded, it will try to
 * use `[target-name].config.js`, located on the configuration folder.
 * @property {string} [path='config/']
 * The path where the configuration files are located.
 * @property {boolean} [hasFolder=true]
 * Whether or not there's a folder with the target name on the configuration path.
 * @property {string} [defineOn='process.env.CONFIG']
 * The name of the variable where the configuration is going to be replaced on your code when
 * bundled.
 * @property {string} [environmentVariable='CONFIG']
 * The name of the environment variable projext will check when building the target in order to
 * load a dynamic configuration.
 * @property {boolean} [loadFromEnvironment=true]
 * Whether or not projext should check for the environment variable value.
 * @property {string} [filenameFormat='[target-name].[configuration-name].config.js']
 * The name format of the configuration files.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateLibraryOptions
 * @property {string} [libraryTarget='umd']
 * How the library will be exposed: `commonjs2`, `umd` or `window`.
 * @property {boolean} [compress=false]
 * Whether or not to use gzip compression on the generated library file.
 */

/**
 * ================================================================================================
 * Project configuration > Targets and target templates > Node
 * ================================================================================================
 */

/**
 * @typedef {Object} ProjectConfigurationNodeTargetTemplate
 * @property {boolean} [bundle=false]
 * Whether or not the target needs to be bundled.
 * If the value is `false`, when running on a development environment, and if the target doesn't
 * need transpilation, the code won't be moved to the distribution directory.
 * @property {boolean} [transpile=false]
 * This option is kind of tied to the previous one: You may not want to bundle your Node target,
 * but you can transpile it with [Babel](https://babeljs.io) if you want to use a feature not yet
 * supported by the runtime.
 * @property {string} [engine='webpack']
 * In case `bundle` is `true`, this will tell projext which build engine you are going to bundle
 * the target code with.
 * @property {boolean} [hasFolder=true]
 * Whether your target code is on a sub folder of the source directory (`src/[target-name]/`) or
 * the contents of the source directory are your target code (useful when working with a single
 * target).
 * @property {boolean} [createFolder=true]
 * Whether or not to create a folder for your targets code on the distribution directory when the
 * target is bundled/copied.
 * @property {string} [folder='']
 * If either `hasFolder` or `createFolder` is `true`, this can be used to specify a different
 * folder name than the target's name.
 * @property {ProjectConfigurationTargetTemplateEntry} [entry]
 * The target entry files for each specific build type.
 * @property {ProjectConfigurationTargetTemplateOutput} [output]
 * The target output settings for each specific build type.
 * @property {ProjectConfigurationNodeTargetTemplateCSSSettings} [css]
 * These options help you customize the way the bundling process handles your CSS code.
 * @property {Array} [includeModules=[]]
 * This setting can be used to specify a list of node modules you want to process on your bundle.
 * @property {Array} [excludeModules=[]]
 * This setting can be used to specify a list of modules that should never be bundled. By default,
 * projext will exclude all the dependencies from the `package.json`, but if you import modules
 * using a sub path (like `colors/safe` instead of `colors`), you need to specify it on this list
 * so the build engine won't try to put it inside the bundle it.
 * @property {Array} [includeTargets=[]]
 * This setting can be used to specify a list of other targets you want to process on your bundle.
 * This means that JS and SCSS files from these targets will be transpiled/processed.
 * @property {boolean} [runOnDevelopment=false]
 * This tells projext that when the target is builded (bundled/copied) on a development
 * environment, it should execute it.
 * @property {ProjectConfigurationNodeTargetTemplateBabelSettings} [babel]
 * The target transpilation options.
 * @property {boolean} [flow=false]
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support and, in case it was disabled, it will enable transpilation.
 * @property {boolean} [library=false]
 * If the project is bundled, this will tell the build engine that it needs to be builded as a
 * library to be `require`d.
 * @property {ProjectConfigurationNodeTargetTemplateLibraryOptions} [libraryOptions]
 * In case `library` is `true`, these options are going to be used by the build engine to configure
 * your library
 * @property {boolean} [cleanBeforeBuild=true]
 * Whether or not to remove all code from previous builds from the distribution directory when
 * making a new build.
 */

/**
 * @typedef {Object} NodeTarget
 * @property {boolean} bundle
 * Whether or not the target needs to be bundled.
 * If the value is `false`, when running on a development environment, and if the target doesn't
 * need transpilation, the code won't be moved to the distribution directory.
 * @property {boolean} transpile
 * This option is kind of tied to the previous one: You may not want to bundle your Node target,
 * but you can transpile it with [Babel](https://babeljs.io) if you want to use a feature not yet
 * supported by the runtime.
 * @property {string} engine
 * In case `bundle` is `true`, this will tell projext which build engine you are going to bundle
 * the target code with.
 * @property {boolean} hasFolder
 * Whether your target code is on a sub folder of the source directory (`src/[target-name]/`) or
 * the contents of the source directory are your target code (useful when working with a single
 * target).
 * @property {boolean} createFolder
 * Whether or not to create a folder for your targets code on the distribution directory when the
 * target is bundled/copied.
 * @property {string} folder
 * If either `hasFolder` or `createFolder` is `true`, this can be used to specify a different
 * folder name than the target's name.
 * @property {ProjectConfigurationTargetTemplateEntry} entry
 * The target entry files for each specific build type.
 * @property {ProjectConfigurationTargetTemplateOutput} output
 * The target output settings for each specific build type.
 * @property {ProjectConfigurationTargetTemplateOutput} originalOutput
 * The target output settings for each specific build type, without the placeholders replaced.
 * @property {ProjectConfigurationNodeTargetTemplateCSSSettings} css
 * These options help you customize the way the bundling process handles your CSS code.
 * @property {Array} includeModules
 * This setting can be used to specify a list of node modules you want to process on your bundle.
 * This means that JS files from modules on this list will be transpiled.
 * @property {Array} excludeModules
 * This setting can be used to specify a list of modules that should never be bundled. By default,
 * projext will exclude all the dependencies from the `package.json`, but if you import modules
 * using a sub path (like `colors/safe` instead of `colors`), you need to specify it on this list
 * so the build engine won't try to put it inside the bundle it.
 * @property {Array} includeTargets
 * This setting can be used to specify a list of other targets you want to process on your bundle.
 * This means that JS and SCSS files from these targets will be transpiled/processed.
 * @property {boolean} runOnDevelopment
 * This tells projext that when the target is builded (bundled/copied) on a development
 * environment, it should execute it.
 * @property {ProjectConfigurationNodeTargetTemplateBabelSettings} babel
 * The target transpilation options.
 * @property {boolean} flow
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support and, in case it was disabled, it will enable transpilation.
 * @property {boolean} library
 * If the project is bundled, this will tell the build engine that it needs to be builded as a
 * library to be `require`d.
 * @property {ProjectConfigurationNodeTargetTemplateLibraryOptions} libraryOptions
 * In case `library` is `true`, these options are going to be used by the build engine to configure
 * your library
 * @property {boolean} cleanBeforeBuild
 * Whether or not to remove all code from previous builds from the distribution directory when
 * making a new build.
 * @property {TargetTypeCheck} is
 * To check whether the target type is `node` or `browser`
 * @property {TargetPaths} paths
 * The target absolute paths to both the source directory folder and the distribution directory
 * folder.
 * @property {TargetFolders} folders
 * The target relative paths to both the source directory folder and the distribution directory
 * folder.
 */

/**
 * ================================================================================================
 * Project configuration > Targets and target templates > Browser
 * ================================================================================================
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplate
 * @property {string} [engine='webpack']
 * This will tell projext which build engine you are going to bundle the target code with.
 * @property {boolean} [hasFolder=true]
 * Whether your target code is on a sub folder of the source directory (`src/[target-name]/`) or
 * the contents of the source directory are your target code (useful when working with a single
 * target).
 * @property {boolean} [createFolder=true]
 * Whether or not to create a folder for your targets code on the distribution directory when the
 * target is bundled/copied.
 * @property {string} [folder='']
 * If either `hasFolder` or `createFolder` is `true`, this can be used to specify a different
 * folder name than the target's name.
 * @property {ProjectConfigurationTargetTemplateEntry} [entry]
 * The target entry files for each specific build type.
 * @property {ProjectConfigurationTargetTemplateOutput} [output]
 * The target output settings for each specific build type.
 * @property {ProjectConfigurationBrowserTargetTemplateSourceMapSettings} [sourceMap]
 * The target source map settings for each specific environment build.
 * @property {ProjectConfigurationBrowserTargetTemplateHTMLSettings} [html]
 * In the case the target is an app, these are the options for the `html` file that will include
 * the bundle `<script />`; and if your target is a library, this can be used to test your library.
 * @property {ProjectConfigurationBrowserTargetTemplateCSSSettings} [css]
 * These options help you customize the way the bundling process handles your CSS code.
 * @property {Array} [includeModules=[]]
 * This setting can be used to specify a list of node modules you want to process on your bundle.
 * This means that JS files from modules on this list will be transpiled.
 * @property {Array} [includeTargets=[]]
 * This setting can be used to specify a list of other targets you want to process on your bundle.
 * This means that JS and SCSS files from these targets will be transpiled/processed.
 * @property {boolean} [runOnDevelopment=false]
 * This will tell the build engine that when you build the target for a development environment,
 * it should bring up an `http` server to _"run"_ your target.
 * @property {ProjectConfigurationBrowserTargetTemplateBabelSettings} [babel]
 * These options are used by the build engine to configure [Babel](https://babeljs.io):
 * @property {boolean} [flow=false]
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support for it.
 * @property {boolean} [library=false]
 * This will tell the build engine that it needs to be builded as a library to be `require`d.
 * @property {ProjectConfigurationBrowserTargetTemplateLibraryOptions} [libraryOptions]
 * In case `library` is `true`, these options are going to be used by the build engine to configure
 * your library.
 * @property {boolean} [cleanBeforeBuild=true]
 * Whether or not to remove all code from previous builds from the distribution directory when
 * making a new build.
 * @property {ProjectConfigurationBrowserTargetTemplateDevServerSettings} [devServer]
 * These are the options for the `http` server projext will use when running the target on a
 * development environment.
 * @property {ProjectConfigurationBrowserTargetTemplateConfigurationSettings} [configuration]
 * These are the settings for the feature that allows a browser target to have a dynamic
 * configuration file.
 */

/**
 * @typedef {Object} BrowserTarget
 * @property {string} engine
 * This will tell projext which build engine you are going to bundle the target code with.
 * @property {boolean} hasFolder
 * Whether your target code is on a sub folder of the source directory (`src/[target-name]/`) or
 * the contents of the source directory are your target code (useful when working with a single
 * target).
 * @property {boolean} createFolder
 * Whether or not to create a folder for your targets code on the distribution directory when the
 * target is bundled/copied.
 * @property {string} folder
 * If either `hasFolder` or `createFolder` is `true`, this can be used to specify a different
 * folder name than the target's name.
 * @property {ProjectConfigurationTargetTemplateEntry} entry
 * The target entry files for each specific build type.
 * @property {ProjectConfigurationTargetTemplateOutput} output
 * The target output settings for each specific build type.
 * @property {ProjectConfigurationTargetTemplateOutput} originalOutput
 * The target output settings for each specific build type, without the placeholders replaced.
 * @property {ProjectConfigurationBrowserTargetTemplateSourceMapSettings} sourceMap
 * The target source map settings for each specific environment build.
 * @property {ProjectConfigurationBrowserTargetTemplateHTMLSettings} html
 * In the case the target is an app, these are the options for the `html` file that will include
 * the bundle `<script />`; and if your target is a library, this can be used to test your library.
 * @property {ProjectConfigurationBrowserTargetTemplateCSSSettings} css
 * These options help you customize the way the bundling process handles your CSS code.
 * @property {Array} includeModules
 * This setting can be used to specify a list of node modules you want to process on your bundle.
 * This means that JS files from modules on this list will be transpiled.
 * @property {Array} includeTargets
 * This setting can be used to specify a list of other targets you want to process on your bundle.
 * This means that JS and SCSS files from these targets will be transpiled/processed.
 * @property {boolean} runOnDevelopment
 * This will tell the build engine that when you build the target for a development environment,
 * it should bring up an `http` server to _"run"_ your target.
 * @property {ProjectConfigurationBrowserTargetTemplateBabelSettings} babel
 * These options are used by the build engine to configure [Babel](https://babeljs.io):
 * @property {boolean} flow
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support for it.
 * @property {boolean} CSSModules
 * Whether or not your application uses CSS Modules.
 * @property {boolean} library
 * This will tell the build engine that it needs to be builded as a library to be `require`d.
 * @property {ProjectConfigurationBrowserTargetTemplateLibraryOptions} libraryOptions
 * In case `library` is `true`, these options are going to be used by the build engine to configure
 * your library.
 * @property {boolean} cleanBeforeBuild
 * Whether or not to remove all code from previous builds from the distribution directory when
 * making a new build.
 * @property {ProjectConfigurationBrowserTargetTemplateDevServerSettings} devServer
 * These are the options for the `http` server projext will use when running the target on a
 * development environment.
 * @property {ProjectConfigurationBrowserTargetTemplateConfigurationSettings} configuration
 * These are the settings for the feature that allows a browser target to have a dynamic
 * configuration file.
 * @property {TargetTypeCheck} is
 * To check whether the target type is `node` or `browser`
 * @property {TargetPaths} paths
 * The target absolute paths to both the source directory folder and the distribution directory
 * folder.
 * @property {TargetFolders} folders
 * The target relative paths to both the source directory folder and the distribution directory
 * folder.
 */

/**
 * ================================================================================================
 * Project configuration & Sub properties
 * ================================================================================================
 */

/**
 * @typedef {Object} ProjectConfigurationPathSettings
 * @property {string} [source='src']
 * The directory, relative to your project path, where your targets code is located. On the
 * documentation is often referred as the _"source directory"_.
 * @property {string} [build='dist']
 * The directory, relative to your project path, where your targets bundled code will be located.
 * On the documentation is often referred as the _"distribution directory"_.
 * @property {string} [privateModules='private']
 * This is for the feature that copies when bundling. In case you are using the feature to copy an
 * npm module that, let's say, is not published, projext will save that module (without its
 * dependencies) on that folder.
 */

/**
 * @typedef {Object} ProjectConfigurationTargetTemplates
 * @property {ProjectConfigurationNodeTargetTemplate} [node]
 * The template settings for all targets with the type `node`.
 * @property {ProjectConfigurationBrowserTargetTemplate} [browser]
 * The template settings for all targets with the type `browser`.
 */

/**
 * @typedef {Object} ProjectConfigurationFeatureTriggerSettings
 * @property {boolean} [enabled=true]
 * Whether or not the feature should be triggered when a target is being build.
 * @property {boolean} [onlyOnProduction=true]
 * This tells projext if the feature should be triggered only when building for production, or if
 * it should do it for development too.
 * @property {Array} [targets=[]]
 * This can be used to specify the targets that will trigger the feature when builded. If no target
 * is specified, the feature will be triggered by all the targets.
 */

/**
 * @typedef {Object} ProjectConfigurationCopyFeatureSettings
 * @property {boolean} [enabled=false]
 * Whether or not the feature is enabled.
 * @property {Array} [items=[]]
 * A list of files and/or directories that will be copied. All with paths relative to the project
 * directory.
 * @property {ProjectConfigurationFeatureTriggerSettings} [copyOnBuild]
 * Since the feature is also available through the projext CLI, you can configure how the feature
 * behaves when building.
 */

/**
 * @typedef {Object} ProjectConfigurationVersionRevisionSettings
 * @property {boolean} [enabled=false]
 * Whether or not the revision file feature is enabled.
 * @property {boolean} [copy=true]
 * Whether or not to copy the revision file when the project files are being copied to the
 * distribution directory.
 * @property {string} [filename='revision']
 * The name of the revision file.
 * @property {ProjectConfigurationFeatureTriggerSettings} [createRevisionOnBuild]
 * Since the feature is also available through the projext CLI, you can configure how the feature
 * behaves when building.
 */

/**
 * @typedef {Object} ProjectConfigurationVersionSettings
 * @property {string} [defineOn='process.env.VERSION']
 * The name of the variable where the version is going to be replaced on your code when bundled.
 * @property {string} [environmentVariable='VERSION']
 * The name of the environment variable projext should check to get the project version.
 * @property {ProjectConfigurationVersionRevisionSettings} [revision]
 * This is like a sub-feature. A revision file is a file that contains the version of your project.
 * This is useful when deploying the project to an environment where you have no access to the
 * environment variable.
 *
 * The way the revision file works is by first checking if the environment variable is available
 * and, if not, it will check if the project is on a `GIT` repository and try to get the hash of
 * the last commit.
 */

/**
 * @typedef {Object} ProjectConfigurationWatchSettings
 * @property {boolean} [poll=true]
 * Whether or not to use polling to get the changes on the file system, and if so, it can also be
 * used to specify the ms interval.
 */

/**
 * @typedef {Object} ProjectConfigurationOtherSettings
 * @property {ProjectConfigurationWatchSettings}
 * This is used by projext to configure `watchpack`, which is used to watch Node files that need to
 * be transpiled.
 */

/**
 * @typedef {Object} ProjectConfigurationSettings
 * @property {ProjectConfigurationPathSettings} [paths]
 * This setting is all about where your code is located and where it will be bundled
 * @property {ProjectConfigurationTargetTemplates} [targetsTemplates]
 * There was no way to have _"smart defaults"_ for targets and at the same time allow projext
 * an unlimited amount of targets, and that's why the this setting exists.
 * The targets will extend the template which name is the same as their `type` property.
 * @property {Object} targets
 * This will be a dictionary with the {@link Target} definitions.
 * @property {ProjectConfigurationCopyFeatureSettings} [copy]
 * These settings are for the feature that enables projext to copy files when building targets.
 * @property {ProjectConfigurationVersionSettings} [version]
 * These settings are for the feature that manages your project version.
 * @property {ProjectConfigurationOtherSettings} [others]
 * Miscellaneous options.
 */

/**
 * ================================================================================================
 * Targets and other target related types
 * ================================================================================================
 */

/**
 * @typedef {BrowserTarget|NodeTarget} Target
 */

/**
 * @typedef {function} TargetConfigurationCreator
 * @param {string} overwritePath
 * The path to the file that can create the configuration.
 * @param {ConfigurationFile} baseConfiguration
 * The configuration service that will be extended.
 * @return {ConfigurationFile}
 */

/**
 * @typedef {Object} TargetDefaultHTMLSettings
 * @property {string} title The value of the `<title />` tag.
 * @property {string} bodyAttributes Extra attributes for the `<body />` tag.
 * @property {string} bodyContents The content of the `<body />` tag.
 */

/**
 * @typedef {function} BuildEngineGetCommand
 * @param {Target} target
 * The target information.
 * @param {string} buildType
 * The intended build type: `development` or `production`.
 * @param {boolean} [forceRun=false]
 * Force the target to run even if the `runOnDevelopment` setting is `false`.
 * @return {string}
 * The command the shell script will use to build the target.
 */

/**
 * @typedef {Object} TargetFileRulePathSettings
 * @property {Array} include The list of expressions that match the allowed paths for a rule.
 * @property {Array} exclude The list of expressions that match the paths that should be excluded
 *                           from a rule.
 */

/**
 * @typedef {Object} TargetFileRuleGlobFilesSettings
 * @property {Array} include The list of glob patterns that match the allowed files for a rule.
 * @property {Array} exclude The list of glob patterns that match the files that should be excluded
 *                           from a rule.
 */

/**
 * @typedef {Object} TargetFileRuleFilesSettings
 * @property {Array}                           include The list of expressions that match the
 *                                                     allowed files for a rule.
 * @property {Array}                           exclude The list of expressions that match the
 *                                                     files that should be excluded from a rule.
 * @property {TargetFileRuleGlobFilesSettings} glob    The settings for files but on glob pattern
 *                                                     version. For plugins and libraries that
 *                                                     don't support, or maybe prefer glob over,
 *                                                     expressions.
 */

/**
 * @typedef {Object} TargetFileRuleSettings
 * @property {RegExp}                      extension A expression that validates the extension(s)
 *                                                   the rule is for.
 * @property {string}                      glob      A glob pattern that validates the extension(s)
 *                                                   the rule is for.
 * @property {TargetFileRulePathSettings}  paths     A set of allowed and excluded expressions to
 *                                                   validate the paths where the files can be
 *                                                   found.
 * @property {TargetFileRuleFilesSettings} files     A set of allowed and excluded expressions and
 *                                                   glob patterns for files that would match with
 *                                                   the rule.
 */

/**
 * @typedef {function} TargetFileRuleHandler
 * @param {Target}                 target      The target information.
 * @param {boolean}                hasTarget   Whether or not the rule already has a target, or if
 *                                             this is the first one being added.
 * @param {TargetFileRuleSettings} currentRule The current settings of the rule.
 */

/**
 * @typedef {Object} TargetFontsFileRules
 * @property {TargetFileRule} common The rule for all font files that aren't SVG.
 * @property {TargetFileRule} svg    The rule for SVG fonts.
 */

/**
 * @typedef {Object} TargetFilesRules
 * @property {TargetFileRule}       js      The rule for JS files.
 * @property {TargetFileRule}       scss    The rule for SCSS files.
 * @property {TargetFileRule}       css     The rule for CSS files.
 * @property {TargetFontsFileRules} fonts   The rules for font files.
 * @property {TargetFileRule}       images  The rule for image files.
 * @property {TargetFileRule}       favicon The rule for favicon files.
 */

/**
 * ================================================================================================
 * "Interfaces"
 * ================================================================================================
 */

/**
 * @typedef {Object} BuildEngine
 * @property {BuildEngineGetCommand} getBuildCommand
 * The method used by projext in order to get the shell comands to build and/or run a target.
 */

/**
 * ================================================================================================
 * Others
 * ================================================================================================
 */

/**
 * @typedef {function} ProviderRegisterMethod
 * @param {Projext} app
 * A reference to the projext dependency injection container.
 */

/**
 * @typedef {Object} Provider
 * @property {ProviderRegisterMethod} register
 * The method that gets called by projext when registering the provider.
 */
