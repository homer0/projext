# projext CLI

The projext Command-Line Interface allows you to tell projext which tasks you want to execute and for which targets.

You can run this commands with either [yarn](https://yarnpkg.com), [npx](https://www.npmjs.com/package/npx) or by using a `package.json` script.

## Available commands

### Build targets

It builds a target and moves it bundle to the distribution directory.

```bash
projext build [target] [--type [type]] [--watch] [--run] [--inspect]
```

- **target:** The name of the target you intend to build. If no target is specified, projext will try to use the default target (the one with the project's name or the first on an alphabetical list).
- **type:** Which build type: `development` (default) or `production`.
- **watch:** Watch the target files and update the build. If the target type is Node and it doesn't require bundling nor transpiling, it won't do anything.
- **run:** Run the target after the build is completed. It only works when the build type is `development`.
- **inspect:** Enable the Node inspector. It only works with the `run` flag and if the target type is `node`.

### Watching a target

It tells projext to watch your target files and update the build if they change.

```bash
projext run [target]
```
- **target:** The name of the target you intend to build and watch. If no target is specified, projext will try to use the default target (the one with the project's name or the first on an alphabetical list).

> This is basically an alias of `projext build` that uses the `--watch` flag by default.

### Running a target

If the target is a Node app, it will execute it, otherwise, it will bring up an `http` server to _"run"_ your target.

```bash
projext run [target] [--inspect]
```
- **target:** The name of the target you intend to build and run. If no target is specified, projext will try to use the default target (the one with the project's name or the first on an alphabetical list).
- **inspect:** Enable the Node inspector. It only works if the target type is `node`.

> This is basically an alias of `projext build` that uses the `--run` flag by default.

### Inspecting a Node target

If the target is a Node app, it will execute it and enable the Node inspector.

```bash
projext inspect [target]
```
- **target:** The name of the target you intend to build, run and inspect. If no target is specified, projext will try to use the default target (the one with the project's name or the first on an alphabetical list).

> This is basically an alias of `projext build` that uses the `--run` and `--inspect` flags by default.

### Cleaning previous builds

Removes the files from previous builds from the distribution directory.

```bash
projext clean [target] [--all]
```
- **target:** The name of the target you intend to remove builds from. If no target is specified, projext will try to use the default target (the one with the project's name or the first on an alphabetical list).
- **all:** Instead of just removing a target files, it removes the entire distribution directory.

> This gets automatically called when building if the target `cleanBeforeBuild` setting is `true`.

### Copy the project files

If the feature is enabled (check the project configuration document), this will copy the files and/or directories specified on the feature settings to the distribution directory.

```bash
projext copy-project-files
```

> This gets automatically called when building if the feature is configured to run when building.

### Create the revision file

If the feature is enabled (check the project configuration document), this will create the revision file with the project version.

```bash
projext create-revision
```

> This gets automatically called when building if the feature is configured to run when building.

### Read the project settings

It logs all the project settings on the console. You can also specify a directory-like path to access specific settings.

```bash
projext info [path]
```
- **path:** A directory-like path for an specific setting, for example: `targetsTemplates/browser/html`. If no path is specified, it will log all the project settings.


### Generate resources

projext zero configuration assumes a lot of things about your project in order to run it without a configuration file: Your target(s) settings and, for browser targets, the default HTML.

This command allows you to write down those resources on your project so you can manually modify them:

```bash
projext generate [resource] [options]
```

Resources:

- `config`: Writes a configuration file with your target information.
- `html`: Writes a browser target default HTML file.

For more information about the generators, please check the Zero configuration document.