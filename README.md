# JVMPeg

A React.js, Webpack, ES6, isomophic, Flux (Marty) Red Hat Access Labs application that parses top output and thread dumps and correlates high CPU consuming threads.


![Example output](https://cloud.githubusercontent.com/assets/2019830/8430750/e2c8214a-1f01-11e5-8de4-ec40c93c72cf.png "Example Output")

## Features

* Compilation with Webpack
* React and jsx
* Flux with [Marty](http://martyjs.org/)
* react-router
* Stylesheets can be CSS, LESS, SASS, Stylus or mixed
* Embedded resources like images or fonts use DataUrls if appropriate
* A simple flag loads a react component (and dependencies) on demand.
* Development
  * Development server
  * Optionally Hot Module Replacement development server (LiveReload for Stylesheets and React components enabled)
  * Uses SourceUrl for performance, but you may switch to SourceMaps easily
* Production
  * Server example for prerendering for React components
  * Initial data inlined in page
  * Long Term Caching through file hashes enabled
  * Generate separate css file to avoid FOUC
  * Minimized CSS and javascript
* Also supports coffee-script files if you are more a coffee-script person.
* You can also require markdown or text files for your content.

## Local Installation

Install [node.js](https://nodejs.org) or [io.js](https://iojs.org)

Just clone this repo and change the `origin` git remote.

```text
npm install
```

## Hot Module Replacement development server

``` text
# start the webpack-dev-server in HMR mode
npm run hot-dev-server
# wait for the first compilation is successful

# Ensure Red Hat resources are proxies through httpd or nginx

# in another terminal/console
# start the node.js server in development mode
npm run start-dev

# open this url in your browser
http://foo.redhat.com/labs/jvmpeg
```

The configuration is `webpack-hot-dev-server.config.js`.

It automatically recompiles when files are changed. When a hot-replacement-enabled file is changed (i. e. stylesheets or React components) the module is hot-replaced. If Hot Replacement is not possible the page is refreshed.

Hot Module Replacement has a performance impact on compilation.


## Production compilation and server

``` text
# build the client bundle and the prerendering bundle
npm run build

# start the node.js server in production mode
npm run start

# open this url in your browser
http://foo.redhat.com/labs/jvmpeg
```

The configuration is `webpack-production.config.js`.

The server is at `lib/server.js`

The production setting builds two configurations: one for the client (`build/public`) and one for the serverside prerendering (`build/prerender`).


## Legacy static assets

Assets in `public` are also served.


## Build visualization

After a production build you may want to visualize your modules and chunks tree.

Use the [analyse tool](http://webpack.github.io/analyse/) with the file at `build/stats.json`.


## Loaders and file types

Many file types are preconfigured, but not every loader is installed. If you get an error like `Cannot find module "xxx-loader"`, you'll need to install the loader with `npm install xxx-loader --save` and restart the compilation.

## Pushing to labsdev

```
gg c Message
git tag 1.0.0 && git push --tags labsdev
```

## Common changes to the configuration

### Switch devtool to SourceMaps

Change `devtool` property in `webpack-dev-server.config.js` and `webpack-hot-dev-server.config.js` to `"source-map"` (better module names) or `"eval-source-map"` (faster compilation).

SourceMaps have a performance impact on compilation.

### Enable SourceMaps in production

1. Uncomment the `devtool` line in `webpack-production.config.js`.
2. Make sure that the folder `build\public\debugging` is access controlled, i. e. by password.

SourceMaps have a performance impact on compilation.

SourceMaps contains your unminimized source code, so you need to restrict access to `build\public\debugging`.

### Coffeescript

Coffeescript is not installed/enabled by default to not distrub non-coffee developer, but you can install it easily:

1. `npm install coffee-redux-loader --save`
2. In `make-webpack-config.js` add `".coffee"` to the `var extensions = ...` line.

## License

Copyright (c) 2015 Samuel Mendenhall

MIT (http://www.opensource.org/licenses/mit-license.php)
