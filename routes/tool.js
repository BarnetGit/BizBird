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
	res.render('register', {title: 'ユーザー登録 -- BizBird', Flag: req.session.user.flag});
});

app.get('/userManagement', function(req, res){
	if(req.session.user.flag == "1"){
		CouchCnt.authenticate('loginlist', 'ViewLoginList', function(err,View){
			var loginJson = [];
			for(var LView of View){
				loginJson.push([LView.key, LView.value[0], LView.value[1]]);
			};
			console.log(loginJson);
			res.render('userManagement', {title: 'ユーザＩＤマスタ管理 -- BizBird', Name: req.session.user.name, Flag: req.session.user.flag, ID: req.session.user.id, List: loginJson});
		});
	}else{
		res.render('userManagement', {title: 'ユーザＩＤマスタ管理 -- BizBird', Name: req.session.user.name, Flag: req.session.user.flag, ID: req.session.user.id});
	};
});

app.get('/userModify/:id', function(req, res){
	var CouchID = req.params.id;
	console.log(req.params.id);
	CouchCnt.ShowKeyContent2(CouchID, function(err, json){
		if(err){
			logger.request.error('ユーザＩＤマスタ管理：存在しないユーザーの取得：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: '存在しません'});
			return;
		}
			res.render('userModify', {title: 'ユーザＩＤマスタ管理 -- BizBird', json: json});
	});
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
			logger.request.info('ユーザー登録：書き込み完了：' + req.session.user.name);
			res.render('result', {title: 'ユーザー登録完了 -- BizBird', msg: 'ユーザー登録完了しました', URLtext: '/tool/register'});
		}
	});
});


//ユーザーパスワード変更
app.post('/userManagement', function(req, res, next){
	var json = req.body;
	console.log(req.body);
	var oldpassword = BizBird.hashPassword(req.body.oldpassword);
	var newpassword = BizBird.hashPassword(req.body.newpassword);
	var passconfirm = BizBird.hashPassword(req.body.passconfirm);
		
	//IDがあるかとパスワードが正しいかチェック
	CouchCnt.authenticate('logincheck', 'ViewLoginCheck', function(err,View){
		for(var LView of View){
			if(LView.key == req.session.user.id){
				if(LView.value[0] == oldpassword && newpassword == passconfirm){
					//パスワードの更新
					//json作る
					BizBird.UserModify(req.session.user, newpassword, function(key, createjson){
						var Key = key;
						var json = createjson;
						CouchCnt.ReplaceDocument2(Key, json, function(replaceErr, result){
							if(replaceErr){
								logger.request.error('ユーザー変更：データベース更新エラー：' + req.session.user.name);
								res.render('err', {title: 'エラー', err: 'データベース更新エラー'});
								return;
							}
							logger.request.info('ユーザー変更：更新完了：' + req.session.user.name);
							res.render('result', {title: '更新完了 -- BizBird', msg: '更新完了しました', URLtext: '/tool/userManagement'});
						});
					});
				}else{
					res.render('err', {title: 'エラー', err: '認証エラー'});
					return;
					
				};
			};
		};
	});
});	


//ユーザー削除
app.post('/userManagement/delete', function(req, res, next){
	var json = req.body;
	var userID = req.session.user.id;
	CouchCnt.DeleteDocument2(userID, function(err, result){
		if(err){
			logger.request.error('ユーザー削除：データベース削除エラー：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: 'データベース削除エラー'});
			return;
		}
		logger.request.info('ユーザー削除：削除完了：' + req.session.user.name);
		delete req.session.user;
		res.render('result', {title: '削除完了 -- BizBird', msg: '削除完了しました', URLtext: '/login'});
	});
});


//管理者によるユーザー情報変更
app.post('/userModify', function(req, res, next){
	var json = req.body;
	//パスワードもってくる
	CouchCnt.authenticate('logincheck', 'ViewLoginCheck', function(err,View){
		for(var LView of View){
			if(LView.key == json.id){
				var password = LView.value[0];
				break;
			}
		};
		//json作る
		console.log("password:" ,password);
		BizBird.RootUserModify(json, password, function(key, createjson){
			var Key = key;
			var json = createjson;
			CouchCnt.ReplaceDocument2(Key, json, function(replaceErr, result){
				if(replaceErr){
					logger.request.error('ユーザー変更：データベース更新エラー：' + req.session.user.name);
					res.render('err', {title: 'エラー', err: 'データベース更新エラー'});
					return;
				}
				logger.request.info('ユーザー変更：更新完了：' + req.session.user.name);
				res.render('result', {title: '更新完了 -- BizBird', msg: '更新完了しました', URLtext: '/tool/userManagement'});
			});
		});
	});
});


//管理者によるユーザー削除
app.post('/userModify/delete', function(req, res, next){
	var json = req.body;
	var userID = json.id;
	CouchCnt.DeleteDocument2(userID, function(err, result){
		if(err){
			logger.request.error('ユーザー削除：データベース削除エラー：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: 'データベース削除エラー'});
			return;
		}
		logger.request.info('ユーザー削除：削除完了：' + req.session.user.name);
		res.render('result', {title: '削除完了 -- BizBird', msg: '削除完了しました', URLtext: '/tool/userManagement'});
	});
});


module.exports = app;