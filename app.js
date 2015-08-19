var express = 		require('express')
  ,	bodyParser = 	require('body-parser')
  ,	couchbase = 	require('./routes/couchbase');
				 	require('date-utils');

var CouchCnt = new couchbase();
var app = express();
var nowyear = new Date().toFormat("YYYY");


app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
	res.render('index', {title: 'ログイン -- BizBird'});
});

app.get('/menu', function(req, res){
	res.render('main_menu', {title: 'メインメニュー -- BizBird'});
});

app.get('/maintenance/report', function(req, res){
	res.render('hosyu_report', {title: '保守作業報告 -- BizBird'});
});

app.get('/maintenance/search', function(req, res){
	res.render('hosyu_search', {title: '保守作業履歴検索 -- BizBird'});
});

app.get('/maintenance/history/:id', function(req, res){
	var CouchID = req.params.id;
	CouchCnt.ShowKeyContent(CouchID, function(err, json){
	if(err){
		res.render('err', {title: 'エラー', err: '存在しません'});
		return;
	}
		json.Key = CouchID;
		res.render('hosyu_history', {title: '保守作業履歴表示 -- BizBird', json: json});
	});
});


/*
app.get('/info/share', function(req, res){
	var DesOrder = 2;
	var AscOrder = 1;
	CouchCnt.getView('info_share', 'NewDate', DesOrder, function(err,ParentView){
		if(err){
			res.render('err', {title: 'エラー', err: 'データベースエラー'});
			return;
		}
		console.log(ParentView);
		CouchCnt.getView('info_share', 'child', AscOrder, function(err,ChildView){
			if(err){
				res.render('err', {title: 'エラー', err: 'データベースエラー'});
				return;
			}
			console.log(ChildView);
			for(var PView of ParentView){
				PView.child =[];
				for(var CView of ChildView){
					var parentNo = 3;
					if(PView.id == CView.value[parentNo]){
						CView.value.pop();
						PView.child.push(CView.value);
					}
				}
			}
			console.log(ParentView[3].child);
			res.render('info_share', {title: '情報共有 -- BizBird', json: ParentView});
		});
	});
});

app.get('/info/search', function(req, res){
	res.render('info_search', {title: '情報共有検索 -- BizBird'});
});

app.get('/info/history', function(req, res){
	res.render('info_history', {title: '情報共有検索 -- BizBird'});
});

app.get('/tool', function(req, res){
	res.render('tool', {title: 'ツール -- BizBird'});
});

*/

app.post('/menu', function(req, res){
	res.render('main_menu', {title: 'メインメニュー -- BizBird'});
});

app.post('/maintenance/history', function(req, res){
	var json = req.body;
	var Key = json.Key;
	delete json["Key"];
	var nowdate = new Date().toFormat("YYYY-MM-DD");
	var classification = json.Maintenance_classification;
	if(json.Maintenance_startdate > json.Maintenance_enddate){
		res.render('err', {title: 'エラー', err: '開始日時から終了日時が異常です'});
		return;
	}
	if(! classification) classification = '無し';
	if(! Array.isArray(classification)) classification = [classification];
	json.Maintenance_classification = classification;
	json.updatedate = nowdate;
	json.type = "Maintenance";
	
	CouchCnt.ReplaceDocument(Key, json, function(err, result){
		if(err){
			res.render('err', {title: 'エラー', err: 'データベース更新エラー'});
			return;
		}
		json.Key = Key;
		res.render('hosyu_history', {title: '保守作業履歴表示 -- BizBird', json: json});
	});
	
});

app.post('/maintenance/history/delete', function(req, res){
	var json = req.body;
	var deleteID = json.Key
	var Order = 2;
	CouchCnt.DeleteDocument(deleteID, function(err, result){
		if(err){
			res.render('err', {title: 'エラー', err: 'データベース削除エラー'});
			return;
		}
		CouchCnt.getView('Maintenance', 'SearchDate', Order, function(err,View){});
		res.render('result', {title: '削除完了 -- BizBird', msg: '削除完了しました', URLtext: '/maintenance/search'});
	});
});

app.post('/maintenance/report', function(req, res){
	var nowdate = new Date().toFormat("YYYY-MM-DD");
	var json = req.body;
	var classification = json.Maintenance_classification;
	var IDname = 'ArticleID';
	if(json.Maintenance_startdate > json.Maintenance_enddate){
		res.render('err', {title: 'エラー', err: '開始日時から終了日時が異常です'});
		return;
	}
	if(! classification) classification = '無し';
	if(! Array.isArray(classification)) classification = [classification];
	json.Maintenance_classification = classification;
	json.createdate = nowdate;
	json.type = "Maintenance";
	console.log(json);
	CouchCnt.save(json, IDname, function(err, result){
		if(err){
			res.render('err', {title: 'エラー', err: 'データベース登録エラー'});
			return;
		}
		var Order = 2;
		CouchCnt.getView('Maintenance', 'SearchDate', Order, function(err,View){});
		res.render('result', {title: '書き込み完了 -- BizBird', msg: '書き込み完了しました', URLtext: '/maintenance/report'});
	});
});

app.post('/maintenance/search', function(req, res){
	var json = req.body;
	if(json.startdate === '') json.startdate = '0000-01-01';
	if(json.enddate === '') json.enddate = '9999-12-31';
	console.log(json);
	if(json.startdate > json.enddate){
		res.render('err', {title: 'エラー', err: '開始日時から終了日時が異常です'});
		return;
	}
	var Viewname = ['SearchDate', 'SearchWorker'];
	var Viewno = 0;
	var Order = 2;	//1=昇順 2=降順
	if(json.sortorder == 'date_asc' || json.sortorder == 'date_des'){
		Viewno = 0;
		if(json.sortorder == 'date_asc'){
			Order = 1;
		}else{
			Order = 2;
		}
	}else{
		Viewno = 1;
	}

	CouchCnt.getView('Maintenance', Viewname[Viewno], Order, function(err, View){
		var iSdate = 0;
		var iEdate = 1;
		var iTitle = 2;
		var iWorker = 3;
		var iClassification = 4;
		var iContent = 5;
		
		var jsonarray = new Array();
		var arraynum = 0;
		for(var i = 0; i < View.length; i++){
			//日付が範囲内にあれば
			if(!(View[i].value[iSdate] > json.enddate || View[i].value[iEdate] < json.startdate)){
				for(var ix = 0; ix < View[i].value[iClassification].length; ix++){
					//分類に同じものがあるならば
					if(View[i].value[iClassification][ix] === json.classification || json.classification === 'none'){
						var createjson = {
    						id: View[i].id,
    						start_date: View[i].value[iSdate],
    						end_date: View[i].value[iEdate],
    						title: View[i].value[iTitle],
    						worker: View[i].value[iWorker],
    						classification: View[i].value[iClassification]
    					};
    					if(json.content == ''){
    						delete json["content"];
    					}
    					var ContentStartLength = 0;
    					var ContentEndLength = 0;
    					
    					for(var iix = 0; iix < 2; iix++){
    						//
    						if(View[i].value[iContent].indexOf(json.content, ContentEndLength) >= 0){
    							if(View[i].value[iContent].indexOf(json.content, ContentEndLength) - 10 >= 0){
    								ContentStartLength = View[i].value[iContent].indexOf(json.content, ContentEndLength) - 10;
    							}else{
    								ContentStartLength = 0 + ContentEndLength;
    							}
    							if(View[i].value[iContent].indexOf(json.content, ContentEndLength) + json.content.length + 10 > View[i].value[iContent].length){
    								ContentEndLength = View[i].value[iContent].length;
    							}else{
    								ContentEndLength = View[i].value[iContent].indexOf(json.content, ContentEndLength) + json.content.length + 10;
    							}
    							if(createjson.content == undefined) createjson.content = '';
								createjson.content += '--' + View[i].value[iContent].substring(ContentStartLength,ContentEndLength) + '--';
							}
						}
						jsonarray[arraynum] = createjson; 
						arraynum++;
						break;
					}
				}
			}
		}
		console.log(jsonarray[0]);
		res.render('hosyu_search', {title: '保守作業履歴検索 -- BizBird', json: jsonarray, searchtxt: json.content});
	});
	
});

/*
app.post('/info/share', function(req, res){
	var json = req.body;
	var nowdate = new Date().toFormat("YYYY-MM-DD");
	var IDname = 'ArticleID';
	if(!json.Info_important) json.Info_important = "false";
	if(!json.Info_attention) json.Info_attention = "false";
	if(json.parentNo == ""){
		json.relationship = "parent";
		delete json["parentNo"];
		json.child = [];
	}else{
		json.relationship = "child";
	}
	json.createdate = nowdate;
	json.type = "Share";
	json.createdate = nowdate;
	console.log(json);
	
	CouchCnt.save(json, IDname, function(err, result){
		if(err){
			res.render('err', {title: 'エラー', err: 'データベース登録エラー'});
			return;
		}
		//表示用
		var Order = 2;
		CouchCnt.getView('info_share', 'NewDate', Order, function(err,View){
			CouchCnt.getView('info_share', 'NewDate', Order, function(err,View){
				res.render('info_share', {title: '情報共有 -- BizBird', json: View});
			});
		});
	});
});

*/

app.listen(8080);