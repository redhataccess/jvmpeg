var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var StatsPlugin = require("stats-webpack-plugin");
var loadersByExtension = require("./config/loadersByExtension");

module.exports = function(options) {
	var entry = {
		main: "./app/index"
		// second: "./app/someOtherPage
	};
	var loaders = {
		"jsx": options.hotComponents ? ["react-hot-loader", "babel-loader?stage=0"] : "babel-loader?stage=0",
		"js": {
			loader: "babel-loader?stage=0",
			include: path.join(__dirname, "app")
		},
		"json": "json-loader",
		"coffee": "coffee-redux-loader",
		"json5": "json5-loader",
		"txt": "raw-loader",
		"png|jpg|jpeg|gif|svg": "url-loader?limit=10000",
		"woff|woff2": "url-loader?limit=100000",
		"ttf|eot": "file-loader",
		"wav|mp3": "file-loader",
		"html": "html-loader",
		"md|markdown": ["html-loader", "markdown-loader"]
	};
	// This modular css is bizarre, it may make sense for hot reloading but it creates mangled names and you have
	// to import from the css file and reference the imported name.style.  Futhermore styles don't just
	// apply given they are localized which makes editing the css in the browser a PITA.
	//var cssLoader = options.minimize ? "css-loader?module" : "css-loader?module&localIdentName=[path][name]---[local]---[hash:base64:5]";
	var cssLoader = options.minimize ? "css-loader" : "css-loader?localIdentName=[path][name]---[local]---[hash:base64:5]";
	//var cssLoader = "css-loader";
	var stylesheetLoaders = {
		"css": cssLoader,
		"less": [cssLoader, "less-loader"],
		"styl": [cssLoader, "stylus-loader"],
		"scss|sass": [cssLoader, "sass-loader"]
	};
	var additionalLoaders = [
		// { test: /some-reg-exp$/, loader: "any-loader" }
	];
	var alias = {

	};
	var aliasLoader = {

	};
	var externals = [

	];
	var modulesDirectories = ["web_modules", "node_modules"];
	var extensions = ["", ".web.js", ".js", ".jsx"];
	var root = path.join(__dirname, "app");
	var publicPath = options.devServer ?
        // Default was localhost, but changing to foo.redhat.com to get in the redhat.com domain for CORS
		//"http://localhost:2992/_assets/" :
		// Default is /_assets/ however Access labs requires a prefix of /labs/<name>/
        //"http://foo.redhat.com/_assets/" :
        //"/_assets/";
        "http://foo.redhat.com/labs/jvmpeg/_assets/" :
        "/labs/jvmpeg/_assets/";
	var output = {
		path: path.join(__dirname, "build", options.prerender ? "prerender" : "public"),
		publicPath: publicPath,
		filename: "[name].js" + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : ""),
		chunkFilename: (options.devServer ? "[id].js" : "[name].js") + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : ""),
		sourceMapFilename: "debugging/[file].map",
		libraryTarget: options.prerender ? "commonjs2" : undefined,
		pathinfo: options.debug || options.prerender
	};
    // Excluding all node_module ouput will prevent a lot of spam in the webpack output
	var excludeFromStats = [
        /webpack/,
        /node_modules/
	];
	var plugins = [
		new webpack.PrefetchPlugin("react"),
		new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment")
	];
    // The prerender is not currently used in this particular stack, Marty handles that with marty-express.
	if(options.prerender) {
		plugins.push(new StatsPlugin(path.join(__dirname, "build", "stats.prerender.json"), {
			chunkModules: true,
			exclude: excludeFromStats
		}));
		aliasLoader["react-proxy$"] = "react-proxy/unavailable";
		aliasLoader["react-proxy-loader$"] = "react-proxy-loader/unavailable";
		externals.push(
			/^react(\/.*)?$/,
			/^reflux(\/.*)?$/,
			"superagent",
			"async"
		);
		plugins.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
	} else {
		plugins.push(new StatsPlugin(path.join(__dirname, "build", "stats.json"), {
			chunkModules: true,
			exclude: excludeFromStats
		}));
	}
	if(options.commonsChunk) {
		plugins.push(new webpack.optimize.CommonsChunkPlugin("commons", "commons.js" + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : "")));
	}
	var asyncLoader = {
		test: require("./app/route-handlers/async").map(function(name) {
			return path.join(__dirname, "app", "route-handlers", name);
		}),
		loader: options.prerender ? "react-proxy-loader/unavailable" : "react-proxy-loader"
	};

	Object.keys(stylesheetLoaders).forEach(function(ext) {
		var stylesheetLoader = stylesheetLoaders[ext];
		if(Array.isArray(stylesheetLoader)) stylesheetLoader = stylesheetLoader.join("!");
		if(options.prerender) {
            stylesheetLoaders[ext] = stylesheetLoader.replace(/^css-loader/, "css-loader/locals");
		} else if(options.separateStylesheet) {
			stylesheetLoaders[ext] = ExtractTextPlugin.extract("style-loader", stylesheetLoader);
		} else {
			stylesheetLoaders[ext] = "style-loader!" + stylesheetLoader;
		}
	});
	if(options.separateStylesheet && !options.prerender) {
		plugins.push(new ExtractTextPlugin("[name].css" + (options.longTermCaching ? "?[contenthash]" : "")));
	}
	if(options.minimize && !options.prerender) {
		plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				compressor: {
					warnings: false
				}
			}),
			new webpack.optimize.DedupePlugin()
		);
	}
	if(options.minimize) {
		plugins.push(
			new webpack.DefinePlugin({
				"process.env": {
					NODE_ENV: JSON.stringify("production")
				}
			}),
			new webpack.NoErrorsPlugin()
		);
	}

	return {
		entry: entry,
		output: output,
		target: options.prerender ? "node" : "web",
		module: {
			loaders: [asyncLoader].concat(loadersByExtension(loaders)).concat(loadersByExtension(stylesheetLoaders)).concat(additionalLoaders)
		},
		devtool: options.devtool,
		debug: options.debug,
		resolveLoader: {
			root: path.join(__dirname, "node_modules"),
			alias: aliasLoader
		},
		externals: externals,
		resolve: {
			root: root,
			modulesDirectories: modulesDirectories,
			extensions: extensions,
			alias: alias
		},
		plugins: plugins,
		devServer: {
			stats: {
				cached: false,
				exclude: excludeFromStats
			}
		}
	};
};
