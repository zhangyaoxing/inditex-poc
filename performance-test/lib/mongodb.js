var MongoClient = require("mongodb").MongoClient;
var config = require("config");

module.exports = (function () {
    var _db = null;
    return {
        getDB: async function () {
            if (!_db) {
                console.log("Connecting mongodb...");
                var connString = config.uri;
                var client = new MongoClient(connString);
                await client.connect();
                console.log("Mongodb connected.")
                _db = client.db();
            }
            return _db;
        },
    };
})();