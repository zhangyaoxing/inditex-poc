var vectorSearch = require("../lib/stress-test").vectorSearch;
var getRandomEmbedding = require("../lib/stress-test").getRandomEmbedding;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/vector-search', async function(req, res, next) {
  var embedding = await getRandomEmbedding();
  var result = await vectorSearch(embedding);
  res.json(result).status(200);
});

module.exports = router;
