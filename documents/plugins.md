# projext plugins

Creating plugins for projext is really simple as the tool takes care of finding them on your `package.json`, loading them, allowing them to register services and providing the necessary events so they can interact with the targets.

## Naming convention

All projext plugins names should start with `projext-plugin-`, this allows projext to find them on your project dependencies. Once a plugin is found, projext will be `require` it and call its exported function with a reference to the dependency container.

## Adding services to the container

All the project structure was built using [Jimple](https://yarnpkg.com/en/package/jimple), a port of [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node, so in oder to register a new service, you should `set` it on the container.

Let's say the following code is the `main` file of a plugin:

```js
// Get the service you want to register
const MyService = require('...');

// Export the function that will be called when the plugin is register
module.exports = (projext) => {
  // Set the service on the container
  projext.set('myServiceName', () => new MyService());
}
```

## Events

projext has an `events` service that is an implementation of [wootil's `EventsHub`](https://homer0.github.io/wootils/class/wootils/shared/eventsHub.js~EventsHub.html) and that it uses to emit information events and reduce variables when needed.

```js
...
module.exports = (projext) => {
	...
	const events = projext.get('events');

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

- Name: `revision-file-created`.
- Parameters:
 - `version`: The version written on the file.

This is emitted if the revision file feature is enabled (check the project configuration document) and the command that creates it was called.

### Reducer events

#### List of the project files and/or folders to copy

- Name: `project-files-to-copy`.
- Reduces: The list of files and/or folders to copy.

This event is used if the feature to copy project files is enabled (check the project configuration document) and the command that does the copying is called.

#### Target information

- Name: `target-load`.
- Reduces: A target information.

This is called when projext loads a new target, after defining its paths and applying its type template.

#### The list of commands to build a target

- Name: `build-target-commands-list`.
- Reduces: The list of CLI commands projext uses to build a target.
- Parameters:
 - `target`: The target information.
 - `type`: The build type, `development` or `production`.
 - `run`: Whether or not the target will be executed after building.

In order to build targets, projext generates a list of CLI commands that a shell script executes, and this event is called in order to reduce that list.

#### A target Babel configuration

- Name: `babel-configuration`.
- Reduces: The Babel configuration for an specific target.
- Parameters:
 - `target`: The target information.

When building a target, projext will create a Babel configuration based on this settings, then this event is used to reduce that configuration.
