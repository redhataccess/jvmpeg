var { generateMongoUrl, urlPrefix } = require('./settings');

var mongoUrl    = generateMongoUrl();
var assign      = require("lodash/object/assign");
var Promise     = require("bluebird");
var MongoDB     = Promise.promisifyAll(require("mongodb"));
var MongoClient = Promise.promisifyAll(MongoDB.MongoClient);

console.log(`Connecting to mongo with ${mongoUrl}`);

// http://stackoverflow.com/questions/23597059/promise-and-nodejs-mongodb-driver
module.exports = function(app) {
    app.get(`${urlPrefix}/api/offender/:_id`, function(req, res) {
        var _id = req.params._id;
        console.log(`Fetching: ${_id} from mongo.`);
        res.setHeader("Content-Type", "application/json");
        MongoClient.connectAsync(mongoUrl).then((db) => db.collection("results").findOneAsync({_id: _id}))
            .then((doc) => {
                console.log(`Found doc with length: ${JSON.stringify(doc, null, ' ').length}`);
                res.send(doc)
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });

    app.post(`${urlPrefix}/api/offender`, function(req, res) {
        res.setHeader("Content-Type", "application/json");
        let offender = req.body;
        offender = assign(req.body, {created: +(new Date())});
        MongoClient.connectAsync(mongoUrl).then((db) => db.collection("results").insertOneAsync(offender))
            .then((result) => res.send({status: "success", _id: offender._id}))
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });
};
