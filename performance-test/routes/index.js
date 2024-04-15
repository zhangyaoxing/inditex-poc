var getRandomId = require("../lib/stress-test").getRandomId;
var getEmbedding = require("../lib/stress-test").getEmbedding;
var vectorSearch = require("../lib/stress-test").vectorSearch;
var express = require('express');
var config = require("config");
var router = express.Router();

/* GET home page. */
router.get('/vector-search', async function(req, res, next) {
  var oid = getRandomId();
  var embedding = await getEmbedding(oid);
  var result = await vectorSearch(embedding);
  res.json(result).status(200);
});

module.exports = router;
