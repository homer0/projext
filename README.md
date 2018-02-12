# projext

Bundle and run your javascript project without configuring an specific module bundler.

## Introduction

### What?

Let's start with this:

- **projext is not** an alternative to [webpack](https://webpack.js.org/).
- **projext is not** a module bundler.

Now, this is a tool that allows you to configure a project bundling options on an _"almost-human"_ readable format so you don't have to deal with very complex rules and structures.

The idea is to divide your project bundling on a 4 layers architecture:

| Layer                 |                                                                   |
|-----------------------|-------------------------------------------------------------------|
| Project configuration | Managed by projext                                                |
| Bundler engine        | A projext plugin for Webpack/Rollup/Parcel/etc.                   |
| Framework             | A projext plugin with the framework settings of the used bundler. |
| Others...             | Other plugins like a runner tool or bundler analyzer.             |

#### Quick example

You want to create an [AngularJS](https://angularjs.org/) app and you want to bundle it with webpack. You first need the following dependencies:

- [`projext`](https://yarnpkg.com/en/package/projext)
- [`projext-plugin-webpack`](https://yarnpkg.com/en/package/projext-plugin-webpack)
- [`projext-plugin-webpack-angularjs`](https://yarnpkg.com/en/package/projext-plugin-webpack-angularjs)

Then, on your project configuration you would write this:

```js
module.exports = {
  targets: {
    browser: {
      type: 'browser',
      engine: 'webpack',
      framework: 'angularjs',
    },
  },
};
```

> There are a lot of _"smart defaults"_ on the project configuration, but since this we just want a quick example, we are going to modify just what we need.

That's all you need to do in terms of configuration, after that you can start coding your app.

### Why?

Module bundlers have been around for quite some time now and they are amazing tools, they allow us to do so much, from just putting the files together to transpiling, tree shaking, splitting for lazy load, etc.

I've been bundling projects since [require.js](http://requirejs.org/) was popular, and since mid 2016 I've been using [webpack](https://webpack.js.org/) for almost everything. You can configure every detail, [Babel](https://babeljs.io/) integration, optimizing files, [Express](https://expressjs.com) middlewares, etc; But after year and half, and more than 20 projects built with it... I'm sick and tire of writing the configuration.

I even [wrote a plugin](https://github.com/homer0/webpack-node-utils/) to manage the configurations, but at the end of the day, I always ended up with huge configurations files, tons of rules and a lot of plugins/dependencies that needed to be up to date and comply with each other versions.

> I'm well aware of the new features webpack 4 will bring to the table, including all the _"smart defaults"_, and it looks really promising. But I still believe **this tool is for a different purpose than just bundling**.

At some point I started considering start using [Rollup](https://rollupjs.org/), at least for the non web apps projects. Rollup was getting a lot of traction and since Facebook started adopting it, it got **really** popular.

I tried it for a npm package project and the results were pretty impressive: It doesn't require a lot of configuration and there's not a lot of boiler plate code on the builds.

I considered migrating a few older projects, but I didn't want to have to go over their configurations, so I just kept it for new projects.

Then, a few months ago, [Parcel](https://parceljs.org/) showed up, and the community was all over it (I know, we are a very hype-driven community :P). And, of course, I wanted to use it, but at that point it was too much. That's when I finally understood the _"Javascript Fatigue"_.

And at that point was when I had the first idea for this project: Preparing boiler plates for different bundlers for different scenarios: library, web page, web app, etc. Yes, it wasn't very original, but it was the start.

As you may have suspected, there were a few issues:

- Hard to maintain: Different projects for the same tool that needed to be up-to-date.
- What about the framework? Yes, frameworks are another big cause of the _"Javascript Fatigue"_, and they all have their unique configuration for specific bundlers.
- I had to align every project to whatever the boiler plate needed in order to work.

But thanks to those problems was that I was able to come with a plan for this project:

- Make a tool that would understand your project configuration on an _"almost-human"_ readable format, meaning, try to move almost every configuration to `boolean` or `string` value and no configuration functions.
- Add another layer, on a form of plugin, that would take the project configuration and apply it to a bundler configuration.
- And another layer/plugin that would be the framework implementation for that bundler.

And then I built it. Right now it's only webpack as an bundler engine and AngularJS for webpack as framework, but I'm already building the Rollup engine, adding the [React](https://reactjs.org/) to webpack and planning on then making ports of both AngularJS and React.

My plan is to ask the community for help putting these plugins/recipes together.

### Who?

Of course there's no way this will be helpful for everyone: a tool that works as an abstraction of other tool could never cover all the possible scenarios.

This tool is aimed to those who use bundlers everyday to build web sites, libraries and apps without the need to go to the last optimal detail. If you need to do that, then use the bundler directly, it's the best choice.

## Information

| -            | -                                                                             |
|--------------|-------------------------------------------------------------------------------|
| Package      | projext                                                                       |
| Description  | Bundle your Javascript projects without having to learn how to use a bundler. |
| Node Version | >= v6.10.0                                                                    |

## Usage

### Project configuration and Targets

The first thing you need to do is to create a **`config/project.config.js`** file, that's where all your project configuration goes.

Then you need to define your targets, the things you are going to bundle. You can have from one to all the targets you want, for example:

```js
module.exports = {
  targets: {
    backend: {
      type: 'node',
    },
    frontend: {
      type: 'browser',
      engine: 'webpack',
    },
  },
};
```

> That's actually the configuration of a real project.

As you can see, the there's only one thing you need to define on your target: The `type`. If it's a Node app, you would use `node`; but if the target is going to run on a browser, go with `browser`.

By default, projext doesn't bundle Node apps (yes, it's ironic): For development, it runs them from the source directory, unless they need transpilation, then it moves them to the distribution directory and transpile them. For production, they are moved to the distribution directory whether they need transpilation or not (as a way to creating a deployable directory).

Now, it doesn't do it by default, but if you add a setting `bundle: true` in there, projext will bundle it.

Regarding browser targets, they are always bundled, and as on any target with bundling, it needs a bundling engine. On the configuration above we defined `webpack`, which is also its default value, and in order to use webpack, we need to install the plugin for it: [`projext-plugin-webpack`](https://yarnpkg.com/en/package/projext-plugin-webpack).

And that's all there is for a basic configuration, but I encourage you to [read more about the project configuration](./documents/projectConfiguration.md).

### Writing your app code

projext relays a lot on the project configuration _"smart defaults"_, which are the default values of the settings that I consider to have pre set as there's not a lot of chances that you'd want to change them.

Based on those defaults, the configuration from the previous step assumes the following things:

- For your `backend` target:
 - It's code is located on `src/backend/...`.
 - The main file on development is `start.development.js`.
 - The main file on production is `start.production.js`.
- For your `frontend` target:
 - It's code is located on `src/frontend/...`.
 - The main file for both development and production is `index.js`.

> Those assumptions are really easy to change from the [project configuration](./documents/projectConfiguration.md).

Having that in mind, you can go ahead and create those files with some code on them to try.

### Bundling the code

And we got to the final part, you have your configuration and your targets code, time to bundle them, and the way you do it is by using the `build` command from the `projext` CLI:

> You can use scripts from the `package.json`, `$(npm bin)/` or `npx` too, but for these examples I'll be using `yarn`

```bash
yarn projext build backend
# or
yarn projext build frontend
```

Really simple right? For the `frontend` target, it will take all the source, bundle it and move it to the distribution directory (`dist/` by default, but again, configurable).

For the `backend` target it will give you a warning (not cool, I know), because the default build type is for a development environment and we didn't specify that the target needed to be bundled nor that it needed transpilation, so projext doesn't see the need to move it.

Now, time to build for production:

```bash
yarn projext build backend --type production
# or
yarn projext build frontend --type production
```

Done, the `--type` argument set to `production` tells projext that you are preparing a build production, so it will move everything to the distribution directory.

[Read more about projext CLI](./documents/cli.md)

## Other features

### Running the targets

It's not all about putting all the files together. You can also use projext to run your targets while you code.

For `node` targets, it has a custom implementation of [`nodemon`](https://yarnpkg.com/en/package/nodemon) that will take care of watching and, if needed, transpiling your files while you code.

For `browser` targets it uses the bundle engine to run it so it can update your bundle on any change.

### You can extend most of the things and overwrite EVERYTHING

The whole tool is built using [Jimple](https://yarnpkg.com/en/package/jimple), a port of [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node, and EVERYTHING is registered on the container. You can simple set your own version of a service with the same name in order to overwrite it.

> If you haven't tried [Jimple](https://github.com/fjorgemota/jimple), give it a try, it's excellent for organizing your app dependencies and services.

[Read more about overwriting projext](./documents/overwrite.md).

### Building plugins is really easy

By default, projext checks your package.json for dependencies which names start with `projext-plugin-`, `require` them, they need to export a function that will receive the app container as parameter, thus allowing them to listen for events or even overwrite existing services.

For example, you want to create a plugin for [browserify](https://yarnpkg.com/en/package/browserify) (If someone is interested, please go ahead :)):

You would call your plugin `projext-plugin-browserify` to assure that projext will pick it and `require` it, and then the code would look something like this:

```js
module.exports = (projext) => {
	projext.set('browserifyBuildEngine', ...);
};
```

- [Read more about writing plugins](./documents/plugins.md).
- [Read more about build engines](./documents/engines.md).

### Browser targets configuration

For `node` targets, having multiple configuration files is simple, as they can `require` files on runtime, but in the case of `browser` targets, you would probably want to select the configuration you want to use when you bundle the code and be able to include it inside.

That's why, if enabled, projext creates an instance of [wootil's `AppConfiguration`](https://homer0.github.io/wootils/class/wootils/node/appConfiguration.js~AppConfiguration.html) that `browser` targets can use on the bundling process.

To enable it, you have to edit your target settings:

```js
module.exports = {
  targets: {
    frontend: {
      type: 'browser',
      engine: 'webpack',
      configuration: {
        enabled: false,
      },
    },
  },
};
```

That's all you need to enable the feature, the rest is dictated by the setting _"smart defaults"_:

- You target configurations will be on `config/browser/...`.
- The default configuration will be loaded from `config/browser/browser.config.js`.
- Whenever you write `process.env.CONFIG` on your code, when bundled, it will replaced by the configuration contents.
- If you add `CONFIG=xyz` before the `projext build` command, the service will look for a file `browser.xyz.config.js` and the configuration will be created by extending the default one.

[Read more about browser targets configuration](./documents/browserTargetConfiguration.md)

## Development

Before doing anything, install the repository hooks:

```bash
# You can either use npm or yarn, it doesn't matter
npm run install-hooks
```

### NPM/Yarn Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `npm run install-hooks` | Install the GIT repository hooks.   |
| `npm test`              | Run the project unit tests.         |
| `npm run lint`          | Lint the modified files.            |
| `npm run lint:full`     | Lint the project code.              |
| `npm run docs`          | Generate the project documentation. |
| `npm run todo`          | List all the pending to-do's.       |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.

### To-Dos

I use `@todo` comments to write all the pending improvements and fixes, and [Leasot](https://yarnpkg.com/en/package/leasot) to generate a report. The script that runs it is on `./utils/scripts/todo`.
