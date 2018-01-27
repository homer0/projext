# Overwriting woopack

woopack was built on the idea that everything could be overwritten, so if the default functionalities don't cover all your project scenarios, you could easily overwrite a service and make it work the way you like (and hopefully publish it as a plugin later).

All the project structure was built using [Jimple](https://yarnpkg.com/en/package/jimple), a port of [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node, and EVERYTHING is registered on the container. You can simple set your own version of a service with the same name in order to overwrite it.

The way you get access to the container is by creating a file called `woopack.config.js` on your project root directory, there you'll create your own instance of woopack, register your custom/overwrite services and export it:

```js
// woopack.config.js

// Get the main class
const { Woopack } = require('woopack');

// Create a new instance
const myWoopack = new Woopack();

// Overwrite a service
myWoopack.set('cleaner', () => myCustomCleaner);

// Export your custom version
module.exports = woopack;
```

All woopack commands will first check if you have the file and then fallback to the default app.