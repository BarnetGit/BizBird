var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
				 	require('date-utils');
var bizbird =		require('./bizbird');
var logger = require('./logger');
var CouchCnt = new couchbase();
var BizBird = new bizbird();


var app = express.Router();

app.get('/', function(req, res){
	res.render('tool', {title: 'ツール -- BizBird'});
});

app.get('/register', function(req, res){
	res.render('register', {title: 'ユーザー登録 -- BizBird'});
});


//ユーザー登録
app.post('/register', function(req, res, next){
	var id = req.body.id;
	var password =  BizBird.hashPassword(req.body.password);
	var name = req.body.name;
	
	//もしIDかぶってたら教える
	CouchCnt.authenticate('logincheck', 'ViewLoginCheck', function(err,View){
		for(var LView of View){
			if(LView.key == id){
				res.render('err', {title: 'エラー', err: 'IDが重複しています'});
				return;
			}
		}
	});

//カウチベースにユーザーを登録
	var json = req.body;
	json.password = password;	//ハッシュ化したパスワードをjsonに
	var IDname = json.id;
	CouchCnt.register(IDname, json, function(err, CouchCntres){
		if(err){
			logger.request.error('ユーザー登録：データベース登録エラー：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: 'データベース登録エラー'});
			return;
		}else{
			logger.request.info('保守報告：書き込み完了：' + req.session.user.name);
			res.render('result', {title: 'ユーザー登録完了 -- BizBird', msg: 'ユーザー登録完了しました', URLtext: '/tool/register'});
		}
	});
});


module.exports = app;