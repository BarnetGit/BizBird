var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
  , bizbird =		require('./bizbird')
				 	require('date-utils');
var logger = require('./logger');
var CouchCnt = new couchbase();
var BizBird = new bizbird();
var app = express.Router();

app.get('/report', function(req, res){
	res.render('hosyu_report', {title: '保守作業報告 -- BizBird', Name: req.session.user.name});
});

app.get('/search', function(req, res){
	res.render('hosyu_search', {title: '保守作業履歴検索 -- BizBird'});
});

app.get('/history/:id', function(req, res){
	var CouchID = "Maintenance" + req.params.id;
	CouchCnt.ShowKeyContent(CouchID, function(err, json){
		if(err){
			logger.request.error('保守履歴：存在しない履歴の取得：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: '存在しません'});
			return;
		}
			res.render('hosyu_history', {title: '保守作業履歴表示 -- BizBird', json: json});
	});
});


app.post('/history', function(req, res){
	var json = req.body;
	console.log(json);
	var Key = "Maintenance" + json.myID;
	var nowdate = new Date().toFormat("YYYY-MM-DD");
	var classification = json.Maintenance_classification;
	if(json.Maintenance_startdate > json.Maintenance_enddate){
		res.render('err', {title: 'エラー', err: '開始日時から終了日時が異常です'});
		return;
	}
	if(! classification) classification = '無し';
	if(! Array.isArray(classification)) classification = [classification];
	json.Maintenance_classification = classification;
	json.UpdateDate = nowdate;
	json.type = "Maintenance";
	
	CouchCnt.ReplaceDocument(Key, json, function(err, result){
		if(err){
			logger.request.error('保守履歴：データベース更新エラー：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: 'データベース更新エラー'});
			return;
		}
		logger.request.info('保守履歴：更新完了：' + req.session.user.name);
		res.render('result', {title: '更新完了 -- BizBird', msg: '更新完了しました', URLtext: '/maintenance/search'});
	});
	
});

app.post('/history/delete', function(req, res){
	var json = req.body;
	var deleteID = "Maintenance" + json.myID;
	var Order = 2;
	var limit = 0;
	CouchCnt.DeleteDocument(deleteID, function(err, result){
		if(err){
			logger.request.error('保守履歴：データベース削除エラー：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: 'データベース削除エラー'});
			return;
		}
		logger.request.info('保守履歴：削除完了：' + req.session.user.name);
		res.render('result', {title: '削除完了 -- BizBird', msg: '削除完了しました', URLtext: '/maintenance/search'});
	});
});

app.post('/report', function(req, res){
	var nowdate = new Date().toFormat("YYYY-MM-DD");
	var json = req.body;
	var classification = json.Maintenance_classification;
	var Incrementname = 'ArticleID';
	var IDname = 'Maintenance';
	var limit = 0;
	if(json.Maintenance_startdate > json.Maintenance_enddate){
		res.render('err', {title: 'エラー', err: '開始日時から終了日時が異常です'});
		return;
	}
	if(! classification) classification = '無し';
	if(! Array.isArray(classification)) classification = [classification];
	json.Maintenance_classification = classification;
	json.createdate = nowdate;
	json.UpdateDate = nowdate;
	json.type = "Maintenance";
	console.log(json);
	CouchCnt.save(json, Incrementname, IDname, function(err, result){
		if(err){
			logger.request.error('保守報告：データベース登録エラー：' + req.session.user.name);
			res.render('err', {title: 'エラー', err: 'データベース登録エラー'});
			return;
		}
		logger.request.info('保守報告：書き込み完了：' + req.session.user.name);
		res.render('result', {title: '書き込み完了 -- BizBird', msg: '書き込み完了しました', URLtext: '/maintenance/report'});
	});
});

app.post('/search', function(req, res){
	var json = req.body;
	if(json.startdate === '') json.startdate = '0000-01-01';
	if(json.enddate === '') json.enddate = '9999-12-31';
	console.log(json);
	if(json.startdate > json.enddate){
		res.render('err', {title: 'エラー', err: '開始日時から終了日時が異常です'});
		return;
	}
	var Viewname = 'SearchDate';
	var Order = 2;	//1=昇順 2=降順
	var limit = 0;
	CouchCnt.getView('Maintenance', Viewname, Order, limit, function(err, View){
		BizBird.MaintenanceSearch(json, View, function(jsonarray){
			res.send(jsonarray);
		});

	});
	
});

module.exports = app;