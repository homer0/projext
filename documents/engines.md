# projext build engines

A build engine is what takes care of bundling your target code, projext is just the intermediary.

## Implementing a build engine

A build engine is a plugin that you need to install on your project, so the first requirement is to install it as a dependency, after that you should change your target(s) `engine` setting to the name of the build engine you installed.

> On an ideal world, that would be enough, but never forget to read the plugin `README`.

## Creating a build engine

You should probably start with the Plugins document to get an idea of how plugins work.

Once you are ready, you need to register a service with the name `[your-build-engine-name]BuildEngine` and it should implement one required method:

**`getBuildCommand(target, buildType, forceRun = false)`**

- `target`: The target information.
- `buildType`: `development` or `production`.
- `forceRun`: Whether or not the user intends to run the target after building it, even if the target `runOnDevelopment` setting is `false.

This should return a string with the command(s) the projext shell script should run in order to generate the bundle.

### Let's create a plugin for browserify

The first thing is to create the plugin with the naming convention: `projext-plugin-browserify`.
Now, we'll create a build engine service for it:

> This example is just to show how to create the engine, it will only build the target and nothing else. Not even include it on an HTML file.

```js
// src/browserify.js

class BrowserifyBuildEngine {
  getBuildCommand(target, buildType) {
    const entryFile = path.join(target.paths.source, target.entry[buildType]);
    const output = path.join(target.paths.build, target.name);
    return `browserify ${entryFile} -o ${output}.js`;
  }
}

module.exports = BrowserifyBuildEngine;
```

Really simple, right? Now, assuming the `package.json` `main` entry points to `src/index.js`:

```js
// src/index.js
const BrowserifyBuildEngine = require('./browserify.js');

module.exports = (projext) => {
  projext.set('browserifyBuildEngine', () => new BrowserifyBuildEngine());
};
```

Done, the only thing to do now is to change a target `engine` setting to `browserify` and when building, it will create a bundle using Browserify.
