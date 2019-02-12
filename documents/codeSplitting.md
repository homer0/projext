# Code splitting

This feature allows you to split your bundles on smaller pieces and then load those pieces when you need them (basically, _"lazy loading"_ parts of your bundle).

Let's say you are building an application with an admin panel, you could use code splitting for the route/module that handles the admin panel and only load it if the user goes to an `/admin` route. Doing something like this will make the initial load and the initialization of the app faster, providing a better experience for the user.


## How does it work?

Instead of importing a file on the top of your file, you use `import` as a function and wait for a `Promise` with the module's content to be resolved.

Using the same example as above, here's some code to better understand it: You have a module that exports a function that will return a component for a given route:

```js
import Home from './components/home';
import Admin from './components/admin';

const getComponentForRoute = (route) => {
  switch(route) {
  case '/admin':
    return Admin;
  default:
    return Home;
  }
};

export default getComponentForRoute;
```

Easy enough, if the route is `/admin`, you return the admin panel component, which was imported at the top.

Let's switch it a little bit in order to import the admin panel only when the user goes to `/admin`, thus, splitting it on different bundle:

```js
import Home from './components/home';

const getComponentForRoute = (route) => {
  switch(route) {
  case '/admin':
    return import('./components/admin');
  default:
    return Promise.resolve(Home);
  }
};

export default getComponentForRoute;
```

There are 3 changes here:

1. The `import` for the admin component is not longer on the top.
2. The `case` for `/admin` now returns a call to the `import` function.
3. The default `case` returns `Home` on an already resolved `Promise`.

First and second go together: By using the `import` function instead of doing the regular `import` declaration, we tell the bundle engine that we don't need that file right now, but that it will be required later, so the engine will create a smaller bundle with that code.

Third, why do we return `Home` on a `Promise`? Well, the `import` function returns a promise as the other bundle is loaded asynchronously, we should try to keep a consistent signature for the function, so the part of the app that implements it won't need to know whether the component was loaded from this bundle or a different one.

## How to use it with projext

Adding code splitting to your targets is really simple, you just need to define a `jsChunks` (_"chunks"_ are the smaller bundles with the code that will be lazy loaded) with a value of `true` on you target output settings:

```js
...
output: {
  default: {
    ...
    jsChunks: true,
  },
  ...
}
```

In the example above, you define it on the `default` so both `production` and `development` will inherit it.

This will tell the bundle engine to use code splitting and that the chunks should be on the same directory as the main bundle and that the name format will be `[original-bundle-name].[chunk-name].js`.

You can also set `jsChunks` as a string and send a path and name format for your chunks:

```js
...
output: {
  default: {
    ...
    jsChunks: 'statics/js/[target-name].[hash].[name].js',
  },
  ...
}
```

The special placeholder there is `[name]`, which will be replaced with the chunk name, decided by the bundle engine.

That's all, enable `jsChunks` and enjoy code splitting!

> Currently, the webpack bundle engine will enable code splitting by default (you can even use the special `webpackChunkName` comment to set a name for it) but other engines still need the property in order to make it work. So, if you are using webpack as an engine, you can still enjoy zero configuration and take advantage of this feature.