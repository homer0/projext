# woopack browser target configuration

This feature allows you to have dynamic configurations on your browser targets.

For `node` targets, having multiple configuration files is simple, as they can `require` files on runtime, but in the case of `browser` targets, you would probably want to select the configuration you want to use when you bundle the code and be able to include it inside.

That's why, if enabled, woopack creates an instance of [wootil's `AppConfiguration`](https://homer0.github.io/wootils/class/wootils/node/appConfiguration.js~AppConfiguration.html) that `browser` targets can use on the bundling process.

## Settings

The settings for this feature are on the target own settings, under the `configuration` key:

```js
{
  type: 'browser',
  configuration: {
    enabled: false,
    default: null,
    path: 'config/',
    hasFolder: true,
    defineOn: 'process.env.CONFIG',
    environmentVariable: 'CONFIG',
    loadFromEnvironment: true,
    filenameFormat: '[target-name].[configuration-name].config.js',
  },
}
```

### `enabled`

Whether or not the feature is enabled.

### `default`

The default configuration. It will be the base all the other, _"dynamic"_, configuration will extend.

If not specified, woopack will try to load a configuration file called `[target-name].config.js`, inside the configuration path.

### `path`

The path relative to the root directory where the configurations are located.

### `hasFolder`

If `true`, woopack will append a folder with the name of the target on the configurations path.

### `defineOn`

The name of a variable that, when the target is builded, will be replaced with the configuration object.

### `environmentVariable`

The name of an environment variable where woopack will check for a configuration name.

### `loadFromEvironment`

Whether or not woopack should check the environment variable. This is for cases in which loading the default configuration is enough for your project.

### `filenameFormat`

The name format of the configuration files. `[configuration-name]` will be replaced with the value of the environment variable.

## Using a configuration

First, let's assume the following things:

- You set `enabled` to `true`.
- You left all the other default values.
- You target is named `myapp`

Now, you should be able to use it by sending the environment variable before the woopack command:

```bash
CONFIG=debug [woopack-command-to-build-a-target]
```

This will load `config/myapp/myapp.config.js` and then `config/myapp/myapp.debug.js`.

