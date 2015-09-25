var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
  , bizbird =		require('./bizbird')
				 	require('date-utils');
var logger = require('./logger');
var CouchCnt = new couchbase();
var BizBird = new bizbird();
var app = express.Router();

app.get('/share', function(req, res){
	var DesOrder = 2;
	var AscOrder = 1;
	var limit = 100;
	CouchCnt.getView('info_share', 'parent', DesOrder, limit, function(err,ParentView){
		if(err){
			logger.request.error('情報共有：データベースエラー：' + req.session.user);
			res.render('err', {title: 'エラー', err: 'データベースエラー'});
			return;
		}
		console.log(ParentView);
		limit = 0;
		CouchCnt.getView('info_share', 'child', AscOrder, limit, function(err,ChildView){
			if(err){
			logger.request.error('情報共有：データベースエラー：' + req.session.user);
				res.render('err', {title: 'エラー', err: 'データベースエラー'});
				return;
			}
			console.log(ChildView);
			for(var PView of ParentView){
				PView.value.child =[];
				for(var CView of ChildView){
					if(PView.value.myID == CView.value.parentNo){
						PView.value.child.push(CView.value);
					}
				}
			}
			console.log(ParentView);
			res.render('info_share', {title: '情報共有 -- BizBird', json: ParentView});
		});
	});
});

app.get('/search', function(req, res){
	res.render('info_search', {title: '情報共有検索 -- BizBird'});
});

app.get('/history/:id', function(req, res){
	var CouchID = "info" + req.params.id;
	CouchCnt.ShowKeyContent(CouchID, function(err, json){
		if(err){
			logger.request.error('情報履歴：存在しない値の取得：' + req.session.user);
			res.render('err', {title: 'エラー', err: '存在しません'});
			return;
		}
			console.log(json);
			res.render('info_history', {title: '情報共有検索 -- BizBird', json: json});
	});
});



app.post('/share', function(req, res){
	var json = req.body;
	var nowdate = new Date().toFormat("YYYY-MM-DD");
	var Incrementname = 'ArticleID';
	var IDname = 'info';
	if(!json.Info_important) json.Info_important = "false";
	if(!json.Info_attention) json.Info_attention = "false";
	if(json.parentNo == ""){
		json.relationship = "parent";
		delete json["parentNo"];
	}else{
		json.relationship = "child";
	}
	json.createdate = nowdate;
	json.UpdateDate = nowdate;
	json.type = "Share";
	console.log(json);
	
	CouchCnt.save(json, Incrementname, IDname,  function(err, result){
		if(err){
			logger.request.error('情報共有：データベース登録エラー：' + req.session.user);
			res.render('err', {title: 'エラー', err: 'データベース登録エラー'});
			return;
		}
		logger.request.info('情報共有：書き込み完了：' + req.session.user);
		res.render('result', {title: '書き込み完了 -- BizBird', msg: '書き込み完了しました', URLtext: '/info/share'});
	});
});

app.post('/search', function(req, res){
	var json = req.body
	var DesOrder = 2;
	var AscOrder = 1;
	var limit = 100;
	if(json.start_date === '') json.start_date = '0000-01-01';
	if(json.end_date === '') json.end_date = '9999-12-31';
	if(!json.Info_important) json.Info_important = "false";
	if(!json.Info_attention) json.Info_attention = "false";
	console.log(json);
	CouchCnt.getView('info_share', 'parent', DesOrder, limit, function(err,ParentView){
		if(err){
			logger.request.error('情報共有：データベースエラー：' + req.session.user);
			res.render('err', {title: 'エラー', err: 'データベースエラー'});
			return;
		}
		limit = 0;
		CouchCnt.getView('info_share', 'child', AscOrder, limit, function(err,ChildView){
			if(err){
				logger.request.error('情報共有：データベースエラー：' + req.session.user);
				res.render('err', {title: 'エラー', err: 'データベースエラー'});
				return;
			}
			BizBird.InfoSearch(json, ParentView, ChildView, function(jsonView){
				res.send(jsonView);
			});
		});
	});
});


app.post('/search/sort', function(req, res){
	console.log(req.body);
	var DesOrder = 2;
	var AscOrder = 1;
	var limit = 100;
	CouchCnt.getView('info_share', 'parent', DesOrder, limit, function(err,ParentView){
		if(err){
			logger.request.error('情報共有：ソートのデータベースエラー：' + req.session.user);
			res.render('err', {title: 'エラー', err: 'データベースエラー'});
			return;
		}
		limit = 0;
		CouchCnt.getView('info_share', 'child', AscOrder, limit, function(err,ChildView){
			if(err){
				logger.request.error('情報共有：ソートのデータベースエラー：' + req.session.user);
				res.render('err', {title: 'エラー', err: 'データベースエラー'});
				return;
			}
			for(var PView of ParentView){
				PView.value.child =[];
				for(var CView of ChildView){
					if(PView.id == CView.value.parentNo){
						PView.value.child.push(CView.value);
					}
				}
			}
			res.send(ParentView);
		});
	});
});

app.post('/history', function(req, res){
	var newdate = new Date().toFormat("YYYY-MM-DD");
	var json = req.body;
	var Key = "info" + json.myID;
	if(!json.Info_important) json.Info_important = "false";
	else json.Info_important = "true";
	if(!json.Info_attention) json.Info_attention = "false";
	else json.Info_attention = "true";
	console.log(json);
	CouchCnt.ShowKeyContent(Key, function(err, value){
		if(err){
			logger.request.error('情報共有履歴：データベースエラー：' + req.session.user);
			res.render('err', {title: 'エラー', err: 'データベースエラー'});
			return;
		}
		value.Info_title = json.Info_title;
		value.Info_content = json.Info_content;
		value.category_dai = json.category_dai;
		value.category_cyu = json.category_cyu;
		value.category_syo = json.category_syo;
		value.Info_important = json.Info_important;
		value.Info_attention = json.Info_attention;
		value.UpdateDate = newdate;
		CouchCnt.ReplaceDocument(Key, value, function(err, couchres){
			if(err){
				res.render('err', {title: 'エラー', err: 'データベースエラー'});
				logger.request.error('情報共有履歴：データベースエラー：' + req.session.user);
				return;
			}
			logger.request.info('情報共有履歴：更新完了：' + req.session.user);
			res.render('result', {title: '更新完了 -- BizBird', msg: '更新完了しました', URLtext: '/info/search'});
		});
	});
});	

module.exports = app;