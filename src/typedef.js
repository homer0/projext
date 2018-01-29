/**
 * @external {Jimple}
 * https://yarnpkg.com/en/package/jimple
 */

/**
 * @external {Nodemon}
 * https://github.com/remy/nodemon/blob/master/doc/requireable.md
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
 * @external {APIClientEndpoints}
 * https://homer0.github.io/wootils/typedef/index.html#static-typedef-APIClientEndpoints
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
 * @external {ErrorHandler}
 * https://homer0.github.io/wootils/class/wootils/node/errorHandler.js~ErrorHandler.html
 */

/**
 * @external {RootRequire}
 * https://homer0.github.io/wootils/function/index.html#static-function-rootRequire
 */

/**
 * @typedef {Object} TargetLibraryOptions
 * @property {string} [libraryTarget='commonjs2']
 * How the library will be exposed: `commonjs2`, `umd` and `window`
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
 * @typedef {Object} NodeTargetBabelSettings
 * @property {Array}  [features=[]]
 * woopack includes by default two Babel plugins: `transform-class-properties` and
 * `transform-decorators-legacy`. On this list you can use the values `properties` or `decorators`
 * to include them.
 * If you need other plugins, they can be included on the `overwrites` option.
 * @property {string} [nodeVersion='current']
 * When building the Babel configuration, woopack uses the `babel-preset-env` to just include the
 * necessary stuff. This setting tells the preset the version of Node it should _"complete"_.
 * @property {Object} [overwrites={}]
 * If you know how to use Babel and need stuff that is not covered by woopack, you can use this
 * setting to overwrite/add any value you may need.
 */

/**
 * @typedef {Object} BrowserTargetBabelSettings
 * @property {Array}  [features=[]]
 * woopack includes by default two Babel plugins: `transform-class-properties` and
 * `transform-decorators-legacy`. On this list you can use the values `properties` or `decorators`
 * to include them.
 * If you need other plugins, they can be included on the `overwrites` option.
 * @property {number} [browserVersions=2]
 * When building the Babel configuration, woopack uses the `babel-preset-env` to just include the
 * necessary stuff. This setting tells how many old versions of the major browsers the target needs
 * transpilation for.
 * Major browsers: Firefox, Chrome, Safari and Edge.
 * @property {boolean} [mobileSupport=true]
 * If `true`, the configuration will add to the list of major browsers `iOS` and `Android`.
 * @property {boolean} [polyfill=true]
 * Whether or not the configuration should include the `babel-polyfill` package.
 * @property {Object} [overwrites={}]
 * If you know how to use Babel and need stuff that is not covered by woopack, you can use this
 * setting to overwrite/add any value you may need.
 */

/**
 * @typedef {Object} BrowserTargetDevServerSettings
 * @property {number} [port=2509]
 * The server port.
 * @property {boolean} [reload=true]
 * Whether or not to reload the server when the code changes.
 */

/**
 * @typedef {Object} BrowserTargetConfigurationSettings
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
 * The name of the environment variable woopack will check when building the target in order to
 * load a dynamic configuration.
 * @property {boolean} [loadFromEnvironment=true]
 * Whether or not woopack should check for the environment variable value.
 * @property {string} [filenameFormat='[target-name].[configuration-name].config.js']
 * The name format of the configuration files.
 */

/**
 * @typedef {Object} ProjectConfigurationOutputPathSettings
 * @property {string} [js='static/js']
 * The path to generated Javascript files on the distribution directory.
 * @property {string} [fonts='static/fonts']
 * The path to font files once they are moved to the distribution directory.
 * @property {string} [css='static/css']
 * The path to generated stylesheets on the distribution directory.
 * @property {string} [images='static/img']
 * The path to font files once they are moved to the distribution directory.
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
 * npm module that, let's say, is not published, woopack will save that module (without its
 * dependencies) on that folder.
 * @property {ProjectConfigurationOutputPathSettings} [output]
 * These are paths for static assets that may be generated when bundling a target.
 */

/**
 * @typedef {Object} ProjectConfigurationNodeTargetTemplateEntries
 * @property {string} [development='start.development.js']
 * The target entry point on a development build.
 * @property {string} [production='start.production.js']
 * The target entry point on a production build.
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
 * In case `bundle` is `true`, this will tell woopack which build engine you are going to bundle
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
 * @property {ProjectConfigurationNodeTargetTemplateEntries} [entry]
 * The target entry points for each specific environment build.
 * @property {boolean} [runOnDevelopment=false]
 * This tells woopack that when the target is builded (bundled/copied) on a development
 * environment, it should execute it.
 * @property {NodeTargetBabelSettings} [babel]
 * The target transpilation options.
 * @property {boolean} [flow=false]
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support and, in case it was disabled, it will enable transpilation.
 * @property {boolean} [library=false]
 * If the project is bundled, this will tell the build engine that it needs to be builded as a
 * library to be `require`d.
 * @property {TargetLibraryOptions} [libraryOptions]
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
 * In case `bundle` is `true`, this will tell woopack which build engine you are going to bundle
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
 * @property {ProjectConfigurationNodeTargetTemplateEntries} entry
 * The target entry points for each specific environment build.
 * @property {boolean} runOnDevelopment
 * This tells woopack that when the target is builded (bundled/copied) on a development
 * environment, it should execute it.
 * @property {NodeTargetBabelSettings} babel
 * The target transpilation options.
 * @property {boolean} flow
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support and, in case it was disabled, it will enable transpilation.
 * @property {boolean} library
 * If the project is bundled, this will tell the build engine that it needs to be builded as a
 * library to be `require`d.
 * @property {TargetLibraryOptions} libraryOptions
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
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplateEntries
 * @property {string} [development='index.js']
 * The target entry point on a development build.
 * @property {string} [production='index.js']
 * The target entry point on a production build.
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
 * @property {string} [template='index.html']
 * The file inside your target source that will be used to generate the `html`.
 * @property {string} [filename='index.html']
 * The file that will be generated when your target is bundled. It will automatically include
 * the `<script />` tag to the generated bundle.
 */

/**
 * @typedef {Object} ProjectConfigurationBrowserTargetTemplate
 * @property {string} [engine='webpack']
 * This will tell woopack which build engine you are going to bundle the target code with.
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
 * @property {ProjectConfigurationBrowserTargetTemplateEntries} [entry]
 * The target entry points for each specific environment build.
 * @property {ProjectConfigurationBrowserTargetTemplateSourceMapSettings} [sourceMap]
 * The target source map settings for each specific environment build.
 * @property {ProjectConfigurationBrowserTargetTemplateHTMLSettings} [html]
 * In the case the target is an app, these are the options for the `html` file that will include
 * the bundle `<script />`; and if your target is a library, this can be used to test your library.
 * @property {boolean} [runOnDevelopment=false]
 * This will tell the build engine that when you build the target for a development environment,
 * it should bring up an `http` server to _"run"_ your target.
 * @property {BrowserTargetBabelSettings} [babel]
 * These options are used by the build engine to configure [Babel](https://babeljs.io):
 * @property {boolean} [flow=false]
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support for it.
 * @property {boolean} [CSSModules=false]
 * Whether or not your application uses CSS Modules.
 * @property {boolean} [library=false]
 * This will tell the build engine that it needs to be builded as a library to be `require`d.
 * @property {TargetLibraryOptions} [libraryOptions]
 * In case `library` is `true`, these options are going to be used by the build engine to configure
 * your library.
 * @property {boolean} [cleanBeforeBuild=true]
 * Whether or not to remove all code from previous builds from the distribution directory when
 * making a new build.
 * @property {BrowserTargetDevServerSettings} [devServer]
 * These are the options for the `http` server woopack will use when running the target on a
 * development environment.
 * @property {BrowserTargetConfigurationSettings} [configuration]
 * These are the settings for the feature that allows a browser target to have a dynamic
 * configuration file.
 */

/**
 * @typedef {Object} BrowserTarget
 * @property {string} engine
 * This will tell woopack which build engine you are going to bundle the target code with.
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
 * @property {ProjectConfigurationBrowserTargetTemplateEntries} entry
 * The target entry points for each specific environment build.
 * @property {ProjectConfigurationBrowserTargetTemplateSourceMapSettings} sourceMap
 * The target source map settings for each specific environment build.
 * @property {ProjectConfigurationBrowserTargetTemplateHTMLSettings} html
 * In the case the target is an app, these are the options for the `html` file that will include
 * the bundle `<script />`; and if your target is a library, this can be used to test your library.
 * @property {boolean} runOnDevelopment
 * This will tell the build engine that when you build the target for a development environment,
 * it should bring up an `http` server to _"run"_ your target.
 * @property {BrowserTargetBabelSettings} babel
 * These options are used by the build engine to configure [Babel](https://babeljs.io):
 * @property {boolean} flow
 * Whether or not your target uses [flow](https://flow.org/). This will update the Babel
 * configuration in order to add support for it.
 * @property {boolean} CSSModules
 * Whether or not your application uses CSS Modules.
 * @property {boolean} library
 * This will tell the build engine that it needs to be builded as a library to be `require`d.
 * @property {TargetLibraryOptions} libraryOptions
 * In case `library` is `true`, these options are going to be used by the build engine to configure
 * your library.
 * @property {boolean} cleanBeforeBuild
 * Whether or not to remove all code from previous builds from the distribution directory when
 * making a new build.
 * @property {BrowserTargetDevServerSettings} devServer
 * These are the options for the `http` server woopack will use when running the target on a
 * development environment.
 * @property {BrowserTargetConfigurationSettings} configuration
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
 * This tells woopack if the feature should be triggered only when building for production, or if
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
 * Since the feature is also available through the woopack CLI, you can configure how the feature
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
 * Since the feature is also available through the woopack CLI, you can configure how the feature
 * behaves when building.
 */

/**
 * @typedef {Object} ProjectConfigurationVersionSettings
 * @property {string} [defineOn='process.env.VERSION']
 * The name of the variable where the version is going to be replaced on your code when bundled.
 * @property {string} [environmentVariable='VERSION']
 * The name of the environment variable woopack should check to get the project version.
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
 * This is used by woopack to configure `watchpack`, which is used to watch Node files that need to
 * be transpiled.
 */

/**
 * @typedef {Object} ProjectConfigurationSettings
 * @property {ProjectConfigurationPathSettings} [paths]
 * This setting is all about where your code is located and where it will be bundled
 * @property {ProjectConfigurationTargetTemplates} [targetsTemplates]
 * There was no way to have _"smart defaults"_ for targets and at the same time allow woopack
 * an unlimited amount of targets, and that's why the this setting exists.
 * The targets will extend the template which name is the same as their `type` property.
 * @property {Object} targets
 * This will be a dictionary with the {@link Target} definitions.
 * @property {ProjectConfigurationCopyFeatureSettings} [copy]
 * These settings are for the feature that enables woopack to copy files when building targets.
 * @property {ProjectConfigurationVersionSettings} [version]
 * These settings are for the feature that manages your project version.
 * @property {ProjectConfigurationOtherSettings} [others]
 * Miscellaneous options.
 */

/**
 * @typedef {function} BuildEngineGetCommand
 * @param {Target} target
 * The target information.
 * @param {string} buildType
 * The intended build type: `development` or `production`.
 * @param {boolean} [forceRun=false]
 * Force the target to run even if the `runOnDevelopment` setting is `false`.
 */

/**
 * @typedef {Object} BuildEngine
 * @property {BuildEngineGetCommand} getBuildCommand
 * The method used by woopack in order to get the shell comands to build and/or run a target.
 */

/**
 * @typedef {function} ProviderRegisterMethod
 * @param {Woopack} app
 * A reference to the woopack dependency injection container.
 */

/**
 * @typedef {Object} Provider
 * @property {ProviderRegisterMethod} register
 * The method that gets called by Woopack when registering the provider.
 */
