var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log(router.stack)
  res.send("Kryptoin Auth Server");
});

module.exports = router;
