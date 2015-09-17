var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
				 	require('date-utils');
var CouchCnt = new couchbase();

var app = express.Router();

app.get('/', function(req, res){
	res.render('index', {title: 'メインメニュー -- BizBird'});
});

app.post('/', function(req, res){
	res.render('index', {title: 'メインメニュー -- BizBird'});
});




module.exports = app;