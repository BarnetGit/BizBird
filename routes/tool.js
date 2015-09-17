var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
				 	require('date-utils');
var CouchCnt = new couchbase();

var app = express.Router();

app.get('/', function(req, res){
	res.render('tool', {title: 'ツール -- BizBird'});
});

module.exports = app;