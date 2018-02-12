# projext CLI

The projext Command-Line Interface allows you to tell projext which tasks you want to execute and for which targets.

You can run this commands with either [yarn](https://yarnpkg.com), [npx](https://www.npmjs.com/package/npx) or by using a `package.json` script.

## Available commands

### Build targets

It builds a target and moves it bundle to the distribution directory.

```bash
projext build [target] [--type [type]] [--run]
```

- **target:** The name of the target you intend to build.
- **type:** Which build type: `development` (default) or `production`.
- **run:** Run the target after the build is completed. It only works when the build type is `development`.

### Running a target

If the target is a Node app, it will execute it, otherwise, it will bring up an `http` server to _"run"_ your target.

```bash
projext run [target]
```
- **target:** The name of the target you intend to build and run.

> This is basically an alias of `projext build` that uses the `--run` flag by default.

### Cleaning previous builds

Removes the files from previous builds from the distribution directory.

```bash
projext clean [target]
```

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
