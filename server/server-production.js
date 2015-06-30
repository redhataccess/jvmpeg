var settings = require('./settings');

var ipAddress = settings.resolveEnvVar('OPENSHIFT_IOJS_IP') || '127.0.0.1';
var port = settings.resolveEnvVar('OPENSHIFT_IOJS_PORT') || 8080;

require("./index")({
	env: 'production',
    separateStylesheet: true,
    ipAddress: ipAddress,
	port: port
});