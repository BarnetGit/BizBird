var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
  , bizbird =		require('./bizbird')
				 	require('date-utils');
var CouchCnt = new couchbase();
var BizBird = new bizbird();
var logger = require('./logger');

var app = express.Router();

app.get('/', function(req, res){
	var Order = 2;
	var limit = 10;
	var Weekdate = new Date();
	Weekdate.setDate(Weekdate.getDate() - 7);
	Weekdate = Weekdate.toFormat("YYYY-MM-DD");
	console.log(Weekdate);
	CouchCnt.getView('Maintenance', 'SearchDate', Order, limit, function(err, MaintenanceView){
		if(err){
			res.render('err', {title: 'エラー', err: 'データベースエラー'});
			return;
		}
		CouchCnt.getView('info_share', 'NewDate', Order, limit, function(err, InfoView){
			if(err){
				res.render('err', {title: 'エラー', err: 'データベースエラー'});
				return;
			}
			var MaintenanceJson = [];
			var InfoJson = [];
			var MaintenanceCreateDateNo = 6;
			var InfoCreateDateNo = 0;
			var MaintenanceTitleNo = 2;
			for(var MView of MaintenanceView){
				if(Weekdate <= MView.value[MaintenanceCreateDateNo]){
					MaintenanceJson.push([MView.value[MaintenanceCreateDateNo], MView.value[MaintenanceTitleNo]]);
				}
			}
			for(var IView of InfoView){
				if(Weekdate <= IView.value[InfoCreateDateNo]){
					InfoJson.push(IView.value);
				}
			}
			console.log(MaintenanceJson);
			
			//セッションを切る
			delete req.session.user;
			res.render('login', {title: 'ログイン -- BizBird', NewMaintenance: MaintenanceJson, NewInfo: InfoJson});
		});
	});
});

//ログイン
app.post('/', function(req, res, next){
	var id = req.body.id;
	var password = req.body.password;
	//var password =  BizBird.hashPassword(req.body.password);
	CouchCnt.authenticate('logincheck', 'ViewLoginCheck', function(err,View){
		for(var LView of View){
			if(LView.key == id){
				if(LView.value[0] == password){
					var Name = LView.value[1]
					req.session.user = {name: Name};
					logger.request.info('ログインユーザー：' + Name);
					res.render('index', {title: 'メインメニュー -- BizBird'});
					return;
				}else{
					res.render('err', {title: 'エラー', err: '認証エラー'});
					return;
				}
			}
		}
		res.render('err', {title: 'エラー', err: '認証エラー'});
	});
});

module.exports = app;