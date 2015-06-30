var settings = require('./settings');

var ipAddress = settings.resolveEnvVar('OPENSHIFT_NODEJS_IP') || settings.resolveEnvVar('OPENSHIFT_NODEDIY_IP') || '127.0.0.1';
var port = settings.resolveEnvVar('OPENSHIFT_INTERNAL_PORT') || settings.resolveEnvVar('OPENSHIFT_NODEDIY_PORT') || settings.resolveEnvVar('OPENSHIFT_NODEJS_PORT') || 8080;

require("./index")({
	env: 'production',
    separateStylesheet: true,
    ipAddress: ipAddress,
	port: port
});