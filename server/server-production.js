var settings = require('./settings');

var ipAddress = settings.resolveEnvVar('OPENSHIFT_NODEJS_IP') || settings.resolveEnvVar('OPENSHIFT_NODEDIY_IP') || '127.0.0.1';

require("./index")({
	env: 'production',
    separateStylesheet: true,
    ipAddress: ipAddress,
	defaultPort: 8080
});