# Project Configuration

These are the settings that will determine how projext will handle your project.

**The file must be created on `[YOUR-PROJECT-PATH]/config/project.config.js`**

There's no _"top level"_ setting, everything is separated in different scopes relevant to one specific thing:

```js
{
  // Everything related to where your code is and where it will be bundled.
  paths: ...,

  // The default templates for your target settings.
  targetsTemplates: ...,

  // Your targets information - This must be overwritten.
  targets: ...,

  // The settings of the feature that copies files when bundling.
  copy: ...,

  // The settings of the feature the manages your project version.
  version: ...,

  // Miscellaneous settings.
  others: ...,
}
```

## `paths`

This setting is all about where your code is located and where it will be bundled:

```js
{
  paths: {
    source: 'src',
    build: 'dist',
    privateModules: 'private',
  }
}
```

### `source`

The directory, relative to your project path, where your targets code is located. On the documentation is often referred as the _"source directory"_.

### `build`

The directory, relative to your project path, where your targets bundled code will be located. On the documentation is often referred as the _"distribution directory"_.

### `privateModules`

This is for the feature that copies when bundling. In case you are using the feature to copy an npm module that, let's say, is not published, projext will save that module (without its dependencies) on that folder.

## `targetsTemplates`

There was no way to have _"smart defaults"_ for targets and at the same time allow projext an unlimited amount of targets, and that's why the this setting exists.

The targets will extend the template which name is the same as their `type` property:

```js
{
  node: ...,
  browser: ...,
}
```

Since there are a lot of settings for the templates, will divide them by type and see each one on detail.

### `node`

```js
{
  type: 'node',
  bundle: false,
  transpile: false,
  engine: 'webpack',
  hasFolder: true,
  createFolder: false,
  folder: '',
  entry: { ... },
  output: { ... },
  runOnDevelopment: false,
  babel: { ... },
  flow: false,
  library: false,
  libraryOptions: { ... },
  cleanBeforeBuild: true,
}
```

#### `bundle`
> Default value: `false`

Whether or not the target needs to be bundled. Yes, it's kind of ironic that a tool that aims to simplify bundling would have an option like this, but there are a few scenarios where this may be useful:

- You are bundling a frontend while you have your backend running on Node, you can bundle your frontend and just copy your backend.
- You have no frontend target and you are using projext just to organize, run and prepare the distributable files.

If the value is `false`, when running on a development environment, and if the target doesn't need transpilation, the code won't be moved to the distribution directory.

#### `transpile`
> Default value: `false`

This option is kind of tied to the previous one: You may not want to bundle your Node target, but you can transpile it with [Babel](https://babeljs.io) if you want to use a feature not yet supported by the runtime.

#### `engine`
> Default value: `webpack`

In case `bundle` is `true`, this will tell projext which build engine you are going to bundle the target code with.

> If you don't intend to change its default value, you need to have the package [`projext-plugin-webpack`](https://yarnpkg.com/en/package/projext-plugin-webpack) installed.

#### `hasFolder`
> Default value: `true`

Whether your target code is on a sub folder of the source directory (`src/[target-name]/`) or the contents of the source directory are your target code (useful when working with a single target).

#### `createFolder`
> Default value: `false`

Whether or not to create a folder for your targets code on the distribution directory when the target is bundled/copied.

#### `folder`
> Default value: `''`

If either `hasFolder` or `createFolder` is `true`, this can be used to specify a different folder name than the target's name.

#### `entry`
> Default value
>
> ```js
> {
>   default: 'index.js',
>   development: null,
>   production: null,
> }
> ```

This object is the one that tells projext which is the main file (executable) of your target for each specific environment. If you set `null` to an entry for an specific environment, it will fallback to the value of the `default` setting.

#### `output`
> Default value:
>
> ```js
> {
>   default: {
>     js: '[target-name].js',
>     fonts: 'statics/fonts/[name].[hash].[ext]',
>     css: 'statics/styles/[target-name].[hash].css',
>     images: 'statics/images/[name].[hash].[ext]',
>   },
>   development: {
>     fonts: 'statics/fonts/[name].[ext]',
>     css: 'statics/styles/[target-name].css',
>     images: 'statics/images/[name].[ext]',
>   },
>   production: null,
> }
> ```

This tells projext where to place the files generated while bundling on each environment, depending on the file type.

You can use the following placeholders:

- `[target-name]`: The name of the target.
- `[hash]`: A random hash generated for cache busting.
- `[name]`: The file original name (Not available for `css` and `js`).
- `[ext]`: The file original extension (Not available for `css` and `js`).

#### `runOnDevelopment`
> Default value: `false`

This tells projext that when the target is builded (bundled/copied) on a development environment, it should execute it.

When the target needs to be bundled, it will relay on the build engined to do it, otherwise, projext will use its custom implementation of [`nodemon`](https://yarnpkg.com/en/package/nodemon) for watching and, if needed, transpile your target code.

#### `babel`
> Default value:
>
> ```js
> {
>   features: [],
>   nodeVersion: 'current',
>   overwrites: {},
> }
> ```

These options are used in the case the target needs to be bundled or transpile to configure [Babel](https://babeljs.io):

**`babel.features`**

projext includes by default two Babel plugins: [`transform-class-properties`](https://yarnpkg.com/en/package/babel-plugin-transform-class-properties) and [`transform-decorators-legacy`](https://yarnpkg.com/en/package/babel-plugin-transform-decorators-legacy). On this list you can use the values `properties` or `decorators` to include them.

If you need other plugins, they can be included on the `overwrites` option.

**`babel.nodeVersion`**

When building the Babel configuration, projext uses the [`babel-preset-env`](https://yarnpkg.com/en/package/babel-preset-env) to just include the necessary stuff. This setting tells the preset the version of Node it should _"complete"_.

**`babel.overwrites`**

If you know how to use Babel and need stuff that is not covered by projext, you can use this setting to overwrite/add any value you may need.

#### `flow`
> Default value: `false`

Whether or not your target uses [flow](https://flow.org/). This will update the Babel configuration in order to add support and, in case it was disabled, it will enable transpilation.

#### `library`
> Default value: `false`

If the project is bundled, this will tell the build engine that it needs to be builded as a library to be `require`d.

#### `libraryOptions`
> Default value:
>
> ```js
> {
>   libraryTarget: 'commonjs2',
> }
> ```

In case `library` is `true`, these options are going to be used by the build engine to configure your library:

**`libraryOptions.libraryTarget`**

How the library will be exposed: `commonjs2`, `umd` or `window`.

> Since this was built based on the webpack API, if you are using it as a build engine, you can set any `libraryTarget` that webpack supports. The ones mentioned above will be the ones projext will support for all the other build engines with different APIs.

#### `cleanBeforeBuild`
> Default value: `true`

Whether or not to remove all code from previous builds from the distribution directory when making a new build.

### `browser`

```js
{
  type: 'browser',
  engine: 'webpack',
  hasFolder: true,
  createFolder: true,
  folder: '',
  entry: { ... },
  output: { ... },
  sourceMap: { ... },
  html: { ... },
  runOnDevelopment: false,
  babel: { ... },
  flow: false,
  CSSModules: false,
  library: false,
  libraryOptions: { ... },
  cleanBeforeBuild: true,
  devServer: { ... },
  configuration: { ... },
}
```

#### `engine`
> Default value: `webpack`

This will tell projext which build engine you are going to bundle the target code with.

> If you don't intend to change its default value, you need to have the package [`projext-plugin-webpack`](https://yarnpkg.com/en/package/projext-plugin-webpack) installed.

#### `hasFolder`
> Default value: `true`

Whether your target code is on a sub folder of the source directory (`src/[target-name]/`) or the contents of the source directory are your target code (useful when working with a single target).

#### `createFolder`
> Default value: `false`

Whether or not to create a folder for your targets code on the distribution directory when the target is bundled/copied.

#### `folder`
> Default value: `''`

If either `hasFolder` or `createFolder` is `true`, this can be used to specify a different folder name than the target's name.

#### `entry`
> Default value
>
> ```js
> {
>   default: 'index.js',
>   development: null,
>   production: null,
> }
> ```

This object is the one that tells projext which is the main file (the one that fires the app) of your target for each specific environment. If you set `null` to an entry for an specific environment, it will fallback to the value of the `default` setting.

#### `output`
> Default value:
>
> ```js
> {
>   default: {
>     js: 'statics/js/[target-name].[hash].js',
>     fonts: 'statics/fonts/[name].[hash].[ext]',
>     css: 'statics/styles/[target-name].[hash].css',
>     images: 'statics/images/[name].[hash].[ext]',
>   },
>   development: {
>     js: 'statics/js/[target-name].js',
>     fonts: 'statics/fonts/[name].[ext]',
>     css: 'statics/styles/[target-name].css',
>     images: 'statics/images/[name].[ext]',
>   },
>   production: null,
> }
> ```

This tells projext where to place the files generated while bundling on each environment, depending on the file type.

You can use the following placeholders:

- `[target-name]`: The name of the target.
- `[hash]`: A random hash generated for cache busting.
- `[name]`: The file original name (Not available for `css` and `js`).
- `[ext]`: The file original extension (Not available for `css` and `js`).

#### `sourceMap`
> Default value:
>
> ```js
> {
>   development: false,
>   production: true,
> }
> ```

Whether or not to disable source map generation for each environment.

#### `html`
> Default value:
>
> ```js
> {
>   default: 'index.html',
>   template: null,
>   filename: null,
> }
> ```

In the case the target is an app, these are the options for the `html` file that will include the bundle `<script />`; and if your target is a library, this can be used to test your library.

**`html.default`**

This would be the fallback if either `template` or `filename` is `null`.

**`html.template`**

The file inside your target source that will be used to generate the `html`.

**`html.filename`**

The file that will be generated when your target is bundled. It will automatically include the `<script />` tag to the generated bundle.

#### `runOnDevelopment`
> Default value: `false`

This will tell the build engine that when you build the target for a development environment, it should bring up an `http` server to _"run"_ your target.

#### `babel`
> Default value:
>
> ```js
> {
>   features: [],
>   browserVersions: 2,
>   mobileSupport: true,
>   polyfill: true,
>   overwrites: {},
> }
> ```

These options are used by the build engine to configure [Babel](https://babeljs.io):

**`babel.features`**

projext includes by default two Babel plugins: [`transform-class-properties`](https://yarnpkg.com/en/package/babel-plugin-transform-class-properties) and [`transform-decorators-legacy`](https://yarnpkg.com/en/package/babel-plugin-transform-decorators-legacy). On this list you can use the values `properties` or `decorators` to include them.

If you need other plugins, they can be included on the `overwrites` option.

**`babel.browserVersions`**

When building the Babel configuration, projext uses the [`babel-preset-env`](https://yarnpkg.com/en/package/babel-preset-env) to just include the necessary stuff. This setting tells how many old versions of the major browsers the target needs transpilation for.

> Major browsers: Firefox, Chrome, Safari and Edge.

**`babel.mobileSupport`**

If `true`, the configuration will add to the list of major browsers `iOS` and `Android`.

**`babel.polyfill`**

Whether or not the configuration should include the [`babel-polyfill`](https://yarnpkg.com/en/package/babel-polyfill) package.

**`babel.overwrites`**

If you know how to use Babel and need stuff that is not covered by projext, you can use this setting to overwrite/add any value you may need.

#### `flow`
> Default value: `false`

Whether or not your target uses [flow](https://flow.org/). This will update the Babel configuration in order to add support for it.

#### `CSSModules`
> Default value: `false`

Whether or not your application uses CSS Modules.

#### `library`
> Default value: `false`

This will tell the build engine that it needs to be builded as a library to be `require`d.

#### `libraryOptions`
> Default value:
>
> ```js
> {
>   libraryTarget: 'umd',
> }
> ```

In case `library` is `true`, these options are going to be used by the build engine to configure your library:

**`libraryOptions.libraryTarget`**

How the library will be exposed: `commonjs`, `umd` or `window`.

> Since this was built based on the webpack API, if you are using it as a build engine, you can set any `libraryTarget` that webpack supports. The ones mentioned above will be the ones projext will support for all the other build engines with different APIs.

#### `cleanBeforeBuild`
> Default value: `true`

Whether or not to remove all code from previous builds from the distribution directory when making a new build.

#### `devServer`
> Default value:
>
> ```js
> {
>   port: 2509,
>   reload: true,
>   host: 'localhost',
>   https: false,
> }
> ```

These are the options for the `http` server projext will use when running the target on a development environment.

**`devServer.port`**

The server port.

**`devServer.reload`**

Whether or not to reload the server when the code changes.

**`devServer.host`**

The dev server hostname.

**`devServer.https`**

Whether or not the dev server host protocol should be `https`.

#### `configuration`
> Default value:
>
> ```js
> {
>   enabled: false,
>   default: null,
>   path: 'config/',
>   hasFolder: true,
>   defineOn: 'process.env.CONFIG',
>   environmentVariable: 'CONFIG',
>   loadFromEnvironment: true,
>   filenameFormat: '[target-name].[configuration-name].config.js',
> }
> ```

These are the settings for the feature that allows a browser target to have a dynamic configuration file.

> For more precise information, check the document about Browser configuration

**`configuration.enabled`**

Whether or not the feature is enabled.

**`configuration.default`**

The default configuration. If none is specified, when the target is builded, it will try to use `[target-name].config.js`, located on the configuration folder.

**`configuration.path`**

The path where the configuration files are located.

**`configuration.hasFolder`**

Whether or not there's a folder with the target name on the configuration path.

**`configuration.defineOn`**

The name of the variable where the configuration is going to be replaced on your code when bundled.

**`configuration.environmentVariable`**

The name of the environment variable projext will check when building the target in order to load a dynamic configuration.

**`configuration.loadFromEnvironment`**

Whether or not projext should check for the environment variable value.

**`configuration.filenameFormat`**

The name format of the configuration files.

## `targets`

This setting is an empty object because this is the only required setting. This is where you'll add your target(s) information, for example:

```js
{
  targets: {
    backend: {
      type: 'node',
    },
    frontend: {
      type: 'browser',
    },
  }
}
```

## `copy`

These settings are for the feature that enables projext to copy files when building targets:

```js
{
  enabled: false,
  items: [],
  copyOnBuild: { ... },
}
```

### `enabled`
> Default value: `false`

Whether or not the feature is enabled.

### `items`
> Default value: `[]`

A list of files and/or directories that will be copied. All with paths relative to the project directory.

### `copyOnBuild`
> Default value:
>
> ```js
> {
>   enabled: true,
>   onlyOnProduction: true,
>   targets: [],
> }
> ```

Since the feature is also available through the projext CLI, you can configure how the feature behaves when building:

#### `copyOnBuild.enabled`
> Default value: `true`

Whether or not to copy the files when building. If disabled, you can use the CLI to copy the files.

#### `copyOnBuild.onlyOnProduction`
> Default value: `true`

This tells projext if the files should be copied only when building for production, or if it should do it for development too.

#### `copyOnBuild.targets`
> Default value: `[]`

This can be used to specify the targets that will trigger the feature when builded. If no target is specified, the feature will be triggered by all the targets.

## `version`

These settings are for the feature that manages your project version:

```js
{
  defineOn: 'process.env.VERSION',
  environmentVariable: 'VERSION',
  revision: { ... },
}
```

### `defineOn`
> Default value: `process.env.VERSION`

The name of the variable where the version is going to be replaced on your code when bundled.

### `environmentVariable`
> Default value: `VERSION`

The name of the environment variable projext should check to get the project version.

### `revision`
> Default value:
>
> ```js
> {
>   enabled: false,
>   copy: true,
>   filename: 'revision',
>   createRevisionOnBuild: { ... },
> }
> ```

This is like a sub-feature. A revision file is a file that contains the version of your project. This is useful when deploying the project to an environment where you have no access to the environment variable.

The way the revision file works is by first checking if the environment variable is available and, if not, it will check if the project is on a `GIT` repository and try to get the hash of the last commit.

#### `revision.enabled`
> Default value: `false`

Whether or not the revision file feature is enabled.

#### `revision.copy`
> Default value: `false`

Whether or not to copy the revision file when the project files are being copied to the distribution directory.

#### `revision.filename`
> Default value: `revision`

The name of the revision file.

#### `revision.createRevisionOnBuild`
> Default value:
>
> ```js
> {
>   enabled: true,
>   onlyOnProduction: true,
>   targets: [],
> }
> ```


Since the feature is also available through the projext CLI, you can configure how the feature behaves when building:

**`revision.createRevisionOnBuild.enabled`**
> Default value: `true`

Whether or not to create the file when building. If disabled, you can use the CLI to copy the files.

**`revision.createRevisionOnBuild.onlyOnProduction`**
> Default value: `true`

This tells projext if the file should be created only when building for production, or if it should do it for development too.

**`revision.createRevisionOnBuild.targets`**
> Default value: `[]`

This can be used to specify the targets that will trigger the feature when builded. If no target is specified, the feature will be triggered by all the targets.

## `others`

Miscellaneous options.

```js
{
  watch: { .. },
}
```

### `watch`
> Default value:
>
> ```js
> {
>   poll: true,
> }
> ```

This is used by projext to configure [`watchpack`](https://yarnpkg.com/en/package/watchpack), which is used to watch Node files that need to be transpiled.

The reason is outside the `targetsTemplate.node` is because this can be used for any other plugin that watches the file system.

#### `watch.poll`
> Default value: `true`

Whether or not to use polling to get the changes on the file system, and if so, it can also be used to specify the ms interval.
