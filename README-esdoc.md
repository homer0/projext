# projext

[![Travis](https://img.shields.io/travis/homer0/projext.svg?style=flat-square)](https://travis-ci.org/homer0/projext)
[![Coveralls github](https://img.shields.io/coveralls/github/homer0/projext.svg?style=flat-square)](https://coveralls.io/github/homer0/projext?branch=master)
[![David](https://img.shields.io/david/homer0/projext.svg?style=flat-square)](https://david-dm.org/homer0/projext)
[![David](https://img.shields.io/david/dev/homer0/projext.svg?style=flat-square)](https://david-dm.org/homer0/projext)

Bundle and run your javascript project without configuring an specific module bundler.

## Introduction

### What?

Let's start with this:

- **projext is not** an alternative to [webpack](https://webpack.js.org/).
- **projext is not** a module bundler.

Now, this is a tool that allows you to configure a project bundling options on an _"almost-human"_ readable format so you don't have to deal with very complex rules and structures.

> projext also has _"zero configuration"_ support so you can start coding right away. Read more about this on the [Zero Configuration document](manual/zeroConfiguration.html).

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

Then, if you want to use a configuration file, you would write something like this:

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

Or you can just create your `src/index.js` and start coding:

```js
// src/index.js

import angular from 'angular';
...
```

projext will look at your code and automatically assume a configuration like the one above.

> There are a lot of _"smart defaults"_ on the project configuration, but since this we just want a quick example, we are going to modify just what we need.

That's all you need to do in terms of configuration, after that you can start coding your app.

### Why?

Module bundlers have been around for quite some time now and they are amazing tools, they allow us to do so much, from just putting the files together to transpiling, tree shaking, splitting for lazy load, etc.

I've been bundling projects since [require.js](http://requirejs.org/) was popular, and since mid 2016 I've been using [webpack](https://webpack.js.org/) for almost everything. You can configure every detail, [Babel](https://babeljs.io/) integration, files optimization, [Express](https://expressjs.com) middlewares, etc; But after year and half, and more than 20 projects built with it... I'm sick and tired of writing the configuration.

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

This is aimed to those who use bundlers everyday to build web sites, libraries and apps without the need to go to the last optimal detail. If you need to do that, then use the bundler directly, it's the best choice.

## Information

| -            | -                                                                             |
|--------------|-------------------------------------------------------------------------------|
| Package      | projext                                                                       |
| Description  | Bundle your Javascript projects without having to learn how to use a bundler. |
| Node Version | >= v8.0.0                                                                    |

## Usage

### Zero configuration

After installing projext and the necessary dependencies for bundling (and framework possibly), you can start coding by just creating a `src/index.js` file on your project.

When you run the CLI commands, projext will automatically find your file, it will check its contents and try to determine if you are writing a browser or a Node app based on the modules and syntax you are using.

[Read more about projext Zero Configuration](manual/zeroConfiguration.html)


### Project configuration

In case you need to overwrite targets settings or enable other projext features, you can create a project configuration file called  `projext.config.js`.

> The project configuration file can be located on the following paths:
>
> - `projext.config.js`
> - `config/projext.config.js`
> - `config/project.config.js`
>
> projext will evaluate the list of paths and use the first one it finds.

The file needs to export a single object that projext will use to merge on top of the _"smart defaults"_.

For example, you want to enable the feature that executes a target when bundled on development:

```js
module.exports = {
  targets: {
    myTarget: {
      runOnDevelopment: true,
    },
  },
};
```

[Read more about the project configuration](manual/projectConfiguration.html).

### Bundling the code

For this example, we are going to assume this is what your targets look like:

```js
module.exports = {
  targets: {
    backend: {
      type: 'node',
    },
    frontend: {
      type: 'browser',
    },
  },
};
```

The way you bundle your targets is by using the `build` command from the projext CLI:

> You can use scripts from the `package.json`, `$(npm bin)/` or `npx` too, but for these examples I'll be using `yarn`

```bash
yarn projext build backend
# or
yarn projext build frontend
```

Really simple right? For the `frontend` target, it will take all the source, bundle it and move it to the distribution directory (`dist/` by default, but again, configurable).

For the `backend` target it will give you a warning (not cool, I know), because the default build type is for a development environment and we didn't specify that the target needed to be bundled nor that it needed transpilation, so projext doesn't see the need to move it.

> By default, projext doesn't bundle nor transpile Node targets code, but you can enable it by changing the `bundle` and/or `transpile` target settings. More about this after the following example.

Now, time to build for production:

```bash
yarn projext build backend --type production
# or
yarn projext build frontend --type production
```

Done, the `--type` argument set to `production` tells projext that you are preparing a build production, so it will move everything to the distribution directory.

[Read more about projext CLI](manual/cli.html)

### projext and Node apps

By default, projext doesn't bundle nor transpile Node targets code (yes, it sounds ironic) as there's not a lot of advantages on doing it and the support for ES+ syntaxs on Node is pretty great.

When you try to bundle a Node target for development, if you didn't change the settings, you'll get a warning that says that there's no need for it; but if you do it for production, the code will be copied to the distribution directory as you may want to deploy it.

Now, Node targets have two special settings: `bundle` and `transpile`. With `bundle` you can specify whether you want to bundle the entire code on a single file or not; and with `transpile` you can tell projext to just transpile the files content using Babel but keeping all the files.


## Other features

### Running the targets

It's not all about putting all the files together. You can also use projext to run your targets while you code.

For `node` targets, it has a custom implementation of [`nodemon`](https://yarnpkg.com/en/package/nodemon) that will take care of watching and, if needed, transpiling your files while you code.

For `browser` targets it uses the bundle engine to run it so it can update your bundle on any change.

### You can extend most of the things and overwrite EVERYTHING

The whole tool is built using [Jimple](https://yarnpkg.com/en/package/jimple), a port of [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node, and EVERYTHING is registered on the container. You can simple set your own version of a service with the same name in order to overwrite it.

> If you haven't tried [Jimple](https://github.com/fjorgemota/jimple), give it a try, it's excellent for organizing your app dependencies and services.

[Read more about overwriting projext](manual/overwrite.html).

### Building plugins is really easy

By default, projext checks your package.json for dependencies which names start with `projext-plugin-`, `require` them, they need to export a function that will receive the app container as parameter, thus allowing them to listen for events or even overwrite existing services.

For example, you want to create a plugin for [browserify](https://yarnpkg.com/en/package/browserify) (If someone is interested, please go ahead :)):

You would call your plugin `projext-plugin-browserify` to assure that projext will pick it and `require` it, and then the code would look something like this:

```js
module.exports = (projext) => {
	projext.set('browserifyBuildEngine', ...);
};
```

- [Read more about writing plugins](manual/plugins.html).
- [Read more about build engines](manual/engines.html).

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

[Read more about browser targets configuration](manual/browserTargetConfiguration.html)

## Development

Before doing anything, install the repository hooks:

```bash
# You can either use npm or yarn, it doesn't matter
yarn run hooks
```

### NPM/Yarn Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `yarn run hooks`        | Install the GIT repository hooks.   |
| `yarn test`             | Run the project unit tests.         |
| `yarn run lint`         | Lint the modified files.            |
| `yarn run lint:full`    | Lint the project code.              |
| `yarn run docs`         | Generate the project documentation. |
| `yarn run todo`         | List all the pending to-do's.       |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.

### To-Dos

I use `@todo` comments to write all the pending improvements and fixes, and [Leasot](https://yarnpkg.com/en/package/leasot) to generate a report. The script that runs it is on `./utils/scripts/todo`.
