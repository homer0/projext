# projext zero configuration

Zero configuration means that you can start your project without having to write any configuration file, just follow a few conventions based on the projext _"smart defaults"_.

## Starting your project without a configuration file

projext's default source directory is set to `src`, so to start your project, you can go and create a `.js` file on `src`, for example `src/index.js`:

```js
// src/index.js

console.log('Hello world');
```

If you do that, projext will assume that you have only one target and it will name it with the name of your project on your `package.json`.

Now you can either run the build or the run command and since you have only one target, it will use that one:

```bash
projext build

# or

projext run
```

Since the code of your file didn't have anything that will flag it as a browser target (a call to `window`, `document`, or to a frontend framework), it will be handled as a Node target.

## Entry files rules

If there's only one Javascript file on the directory, it will use that one as entry point; but if there are more than one it will fallback to an `index.jsx?`.

Now, you can also create index files specific to each build type: `index.development.jsx?` and `index.production.jsx?` and projext will automatically set them on the target configuration.

## Detecting a browser target

Once projext found your entry files, it will pick the production one (`[single-file]` > `index.production.jsx?` > `index.js`), parse it and search for the following things:

- Calls to `global`, `window` or `document`.
- `require`/`import` statements of `@angular/**`, `angular` or `react` (yes, it ignores `react-dom/server`).

If you have any of that on your entry file, your target will be handled as a browser target.

## Default HTML for browser targets

Browser targets require an HTML file for running but if that's something you want to leave for later, projext will provide you with a default HTML file on the fly.

Is not something you should push to production, as it sets the target name as title and doesn't have any `meta` information, but you can use it to start your project.

The default HTML comes with a single `<div id="app"></div>` on the `<body />` and it provides events hooks so plugins can inject frameworks requirements, like the AngularJS plugin does by adding the `ng-app`.

You can also use a generator to bring that code into a file and modify it, please check the "Generators" section on this document.

## Writing a library

On the same process where projext detects the target type, it will look if you are exporting anything `module.exports`/`export` and if it finds an export statement, it will assume your target is meant to be a library, and set the `library` setting to `true`.

## Multiple targets

When projext looks on the `src` directory, if it finds a Javascript file, it will mark the entire directory as a single target, but if the contents of the directory are just folders, it will try and load each folder as a separated target.

So, let's say you have something like this:

```
myApp/
└── src/
    ├── frontend
    │   └── index.js
    └── backend
        └── index.js
```

And

```js
// src/browserTarget/index.js

document.getElementById('#app').innerHTML = 'Hello world!';
```

Done, projext will create the `frontend` and `backend` targets and mark `frontend` as a browser target.

## Verifying the assumptions 

If by any chance you think projext is assuming something that is incorrect, you can verify what projext detected/assumed by using the `info` command

```bash
projext info
```

That will show you the entire project configuration, after detecting targets, merging the smart defaults and applying your own overwrites.

You can even use it with a _"directory-like"_ path for a specific setting:

```bash
projext info targets

# or, let's say you want to check the `libraryOptions` of your frontend target

projext info targets/frontend/libraryOptions
```

## Generators

Generators are CLI commands that allow you to write on a file the resources projext is using as _"smart defaults"_, so you can let projext assume a few things, write them down on a file and start modifying until it suit your needs.

The way you would use a generator is with the `generate` command:

```bash
projext generate [resource] [options]
```

### Project configuration

> Resource type: `config`

You can write down all the information projext has on your target by just running

```bash
projext generate config
```

The generator will ask you for the name of the configuration file you want to write and save **only the targets information**.

You can also overwrite the default (`targets`) and pick all the settings you want with the `--include` flag and _"directory-like"_ paths separated by comma:

```bash
projext generate config --include targetsTemplates/node,copy/copyOnBuild
```

Now, you can also do the opposite and get all the settings and ignore a few:

```bash
projext generate config --all --exclude targetsTemplates/browser,version/revision
```

### Browser target HTML file

> Resource type: `html`

As explained above, browser targets need an HTML file to run with and projext creates it when you don't have one on the target directory. This target basically tells projext to take the HTML it created to run your target and move it to the target directory.

```bash
projext generate html
```

It will ask you for the target name (if you have only one browser target, it will use it as the default) and the location of the file, that's all.