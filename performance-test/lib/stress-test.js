var config = require("config");
var ObjectId = require("mongodb").ObjectId;
var getDB = require("./mongodb").getDB;

var minId = ObjectId.createFromHexString(config.idRange.min);
var maxId = ObjectId.createFromHexString(config.idRange.max);
var minTime = minId.getTimestamp().getTime();
var maxTime = maxId.getTimestamp().getTime();
var time = maxTime - minTime;
var numCandidates = config.numCandidates;
var limit = config.limit;
var numSamples = config.numSamples;
console.log(`_id range set to ${minId.toHexString()}~${maxId.toHexString()}`);

var getRandomId = function() {
    var timestamp = Math.floor((minTime + Math.random() * time) / 1000);
    var hex = timestamp.toString(16) + "0000000000000000";
    console.debug(`ObjectId generated: ${hex}`);

    return ObjectId.createFromHexString(hex);
};
var getEmbeddingInternal = async function(oid) {
    var db = await getDB();
    var doc = await db.collection("paper").findOne({
        _id: {
            "$gte": oid
        }
    });
    var embedding = doc.embedding;
    console.debug(`Document found: ${doc._id}`);
    console.debug(`Embedding: [${embedding[1]},...,${embedding[embedding.length - 1]}]`);

    return embedding;
}
var sampleEmbeddings = [];

module.exports = {
    initialize: async function() {
        console.log(`Sampling the collection to get ${numSamples} embeddings.`);
        for(var i = 0; i < numSamples; i++) {
            var oid = getRandomId();
            var embedding = await getEmbeddingInternal(oid);
            sampleEmbeddings.push(embedding);
        }
        console.log(`${numSamples} embeddings sampled.`);
    },
    getRandomEmbedding: function() {
        var index = Math.floor(Math.random() * numSamples);
        return sampleEmbeddings[index];
    },
    vectorSearch: async function(embedding) {
        var db = await getDB();
        var pipeline = [{
            $vectorSearch: {
                index: "paper_embedding_search",
                path: "embedding",
                queryVector: embedding,
                numCandidates: numCandidates,
                limit: limit
            }
        }, {
            $project: {
                embedding: 0
            }
        }];
        var result = await db.collection("paper").aggregate(pipeline).toArray();
        // console.debug(result);
        return result;
    }
};