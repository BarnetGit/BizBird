var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
  , bizbird =		require('./bizbird')
				 	require('date-utils');
				 	
var CouchCnt = new couchbase();
var BizBird = new bizbird();

var app = express.Router();

//登録
app.post('/', function(req, res){
	var json = req.body;
	var IDname = 'LoginID';
	//前処理
	//重複チェック
	CouchCnt.authenticate('logincheck', 'ViewLoginCheck', function(err,View){
		for(var LView of View){
			if(LView.key == json.id){
				res.render('err', {title: 'エラー', err: '認証エラー'});
				return;
			}
		}
	});
	
	//ハッシュ化
	json.password = BizBird.hashPassword(json.password);

	//DB登録の関数呼ぶ
	CouchCnt.save(json, IDname, function(err, result){
		if(err){
			res.render('err', {title: 'エラー', err: 'データベース登録エラー'});
			return;
		}
	});
	res.render('login', {title: 'ログイン画面'});
	return;
});

app.get('/', function(req, res){
	res.render('register');
});

module.exports = app;