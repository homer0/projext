# woopack plugins

Creating plugins for woopack is really simple as the tool takes care of finding them on your `package.json`, loading them, allowing them to register services and providing the necessary events so they can interact with the targets.

## Naming convention

All woopack plugins names should start with `woopack-plugin-`, this allows woopack to find them on your project dependencies. Once a plugin is found, woopack will be `require` it and call its exported function with a reference to the dependency container.

## Adding services to the container

All the project structure was built using [Jimple](https://yarnpkg.com/en/package/jimple), a port of [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node, so in oder to register a new service, you should `set` it on the container.

Let's say the following code is the `main` file of a plugin:

```js
// Get the service you want to register
const MyService = require('...');

// Export the function that will be called when the plugin is register
module.exports = (woopack) => {
  // Set the service on the container
  woopack.set('myServiceName', () => new MyService());
}
```

## Events

woopack has an `events` service that is an implementation of [wootil's `EventsHub`](https://homer0.github.io/wootils/class/wootils/shared/eventsHub.js~EventsHub.html) and that it uses to emit information events and reduce variables when needed.

```js
...
module.exports = (woopack) => {
	...
	const events = woopack.get('events);

	// Add a new listener for a regular event
	events.on('some-event', () => {
	  console.log('some-event was fired!');
	});
	
	// Add a reducer event
	events.on('some-reducer-events', (someConfiguration) => Object.assign({}, someConfiguration, {
	  name: 'charito',
	}));
});
```

### Regular events

#### Revision file creation

- name: `revision-file-created`.
- parameters:
 - `version`: The version written on the file.

This is emitted if the revision file feature is enabled (check the project configuration document) and the command that creates it was called.

### Reducer events

#### List of the project files and/or folders to copy

- name: `project-files-to-copy`.
- reduces: The list of files and/or folders to copy.

This event is used if the feature to copy project files is enabled (check the project configuration document) and the command that does the copying is called.

#### Target information

- name: `target-load`.
- reduces: A target information.

This is called when woopack loads a new target, after defining its paths and applying its type template.

#### The list of commands to build a target

- name: `build-target-commands-list`.
- reduces: The list of CLI commands woopack uses to build a target.
- parameters:
 - `target`: The target information.
 - `type`: The build type, `development` or `production`.
 - `run`: Whether or not the target will be executed after building.

In order to build targets, woopack generates a list of CLI commands that a shell script executes, and this event is called in order to reduce that list.

#### A target Babel configuration

- name: `babel-configuration`.
- reduces: The Babel configuration for an specific target.
- parameters:
 - `target`: The target information.

When building a target, woopack will create a Babel configuration based on this settings, then this event is used to reduce that configuration.