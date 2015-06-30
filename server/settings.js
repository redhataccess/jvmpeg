var resolveEnvVar = function(envVar) {
    if (envVar === void 0) {
        return void 0;
    }
    if (/^\$/i.test(envVar)) {
        return process.env[envVar.slice(1, envVar.length)];
    }
    return process.env[envVar];
};

var generateMongoUrl = function(db) {
    let openShiftMongoAddr = resolveEnvVar("OPENSHIFT_MONGODB_DB_URL");
    if (openShiftMongoAddr) {
        return `${openShiftMongoAddr}jvmpeg`;
    }
    return "mongodb://localhost:27017/jvmpeg";
};

exports.generateMongoUrl = generateMongoUrl;
exports.resolveEnvVar = resolveEnvVar;
