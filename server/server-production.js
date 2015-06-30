var settings = require('./settings');

var ipAddress = settings.resolveEnvVar('OPENSHIFT_IOJS_IP') || '127.0.0.1';
var port = settings.resolveEnvVar('OPENSHIFT_IOJS_PORT') || 8080;

// By default babel cache will be in the $HOME dir which will not work in Openshift, but the data dir will.
var homeDir = settings.resolveEnvVar('HOME');
var dataDir = settings.resolveEnvVar('OPENSHIFT_DATA_DIR');
var babelCachePath = settings.resolveEnvVar('BABEL_CACHE_PATH');
process.env.BABEL_CACHE_PATH = babelCachePath || (dataDir && dataDir + "/.babel.json") || (homeDir && homeDir + "/.babel.json");

require("./index")({
	env: 'production',
    separateStylesheet: true,
    ipAddress: ipAddress,
	port: port
});