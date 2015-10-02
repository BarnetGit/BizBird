var Couchbase = require('couchbase');
var Cluster = new Couchbase.Cluster('couchbase://***.***.***.***:****');
var Bucket = Cluster.openBucket('serviceReport');
var BucketLogin = Cluster.openBucket('Login');
var CouchbaseCnt = function(){};

//カウチベースに登録
CouchbaseCnt.prototype.save = function(json, Incrementname, IDname, callback){
	var Incremental = 1
	//カウチベース内でのインクリメント（++）操作
	BucketLogin.counter(Incrementname, Incremental, function(err,couchid){
		if(err){
			console.log('インクリメントエラー' + err);
			callback(err,res);
			return;
		}
		var Key = couchid.value;
		json.myID = Key.toString();
		console.log(Key.toString());
		console.log(json);
		IDname += Key;
		Bucket.insert(IDname, json, function(err,res){
			if(err){
				console.log('Insert err' + err);
			}else{
			console.log('Insert Sucsses!');
			}
			callback(err,res);
		});
	});
};

//カウチベースのView表示
CouchbaseCnt.prototype.getView = function(devname, viewname, Order, Limit, callback){
	var ViewQuery = Couchbase.ViewQuery;
	//order 1=昇順 2=降順
	//stale BEFORE=1 NONE=2 AFTER=3
	var query = ViewQuery.from(devname, viewname).order(Order).limit(Limit).stale(ViewQuery.Update.BEFORE);
	if(Limit == 0) query = ViewQuery.from(devname, viewname).order(Order).stale(ViewQuery.Update.BEFORE);
	var jsonarray = new Array();
	Bucket.query(query, function (err, res, meta) {
    	if (err) {
        	console.error('View query failed:', err);
        	callback(err,res);
        	return;
    	}
    	console.log('Found', meta.total_rows);
    	callback(err,res);
	});
};

//カウチベースのドキュメント内表示
CouchbaseCnt.prototype.ShowKeyContent = function(Key, callback){
	Bucket.get(Key, function(err, json){
		if(err){
			console.log('Bucket get failed:' + err);
			callback(err, json);
			return;
		}
		console.log('Bucket get sucsses');
		callback(err, json.value);
	});
};

CouchbaseCnt.prototype.CreateID = function(){
	BucketSec.get('ArticleID',function(err,res){
		if(err){
			console.log('Create id');
			BucketSec.insert('ArticleID', '0', function(err,res){
				if(err){
					console.log('create id failed', err);
					return;
				}
				console.log('create id sucsses!');
			});
		}
	});
};

CouchbaseCnt.prototype.DeleteDocument = function(id, callback){
	Bucket.remove(id, function(err, res){
		if(err){
			console.log('BucketRemove failed', err);
			callback(err, res);
			return;
		}
		console.log('BucketRemove Sucsses');
		callback(err, res);
	});
};

CouchbaseCnt.prototype.ReplaceDocument = function(CouchID, json, callback){
	Bucket.replace(CouchID, json, function(err, res){
		if(err){
			console.log('BucketReplace failed', err);
			callback(err, res);
			return;
		}
		console.log('BucketReplace Sucsses');
		callback(err,res);
	});
};

//田辺用


//認証を行う
CouchbaseCnt.prototype.authenticate = function (devname, viewname, callback) {
	var ViewQuery = Couchbase.ViewQuery;
	var query = ViewQuery.from(devname, viewname).stale(ViewQuery.Update.BEFORE);
	
	var jsonarray = new Array();
	
	BucketLogin.query(query, function (err, res, meta) {
    	if (err) {
        	console.error('View query failed:', err);
        	callback(err,res);
        	return;
    	}
    	console.log('Found', meta.total_rows);
    	callback(err,res);
	});
};


//ユーザー登録
CouchbaseCnt.prototype.register = function (IDname, json, callback){
	BucketLogin.insert(IDname, json, function(err,res){
		if(err){
			console.log('Insert err' + err);
		}else{
			console.log('Insert Sucsses!');
		}
		callback(err,res);
	});
};

//ユーザー更新
CouchbaseCnt.prototype.ReplaceDocument2 = function(CouchID, json, callback){
	console.log("couchID: ", CouchID, "json: ", json);
	BucketLogin.replace(CouchID, json, function(err, res){
		if(err){
			console.log('BucketReplace failed', err);
			callback(err, res);
			return;
		}
		console.log('BucketReplace Sucsses');
		callback(err,res);
	});
};

//ユーザー削除
CouchbaseCnt.prototype.DeleteDocument2 = function(id, callback){
	BucketLogin.remove(id, function(err, res){
		if(err){
			console.log('BucketRemove failed', err);
			callback(err, res);
			return;
		}
		console.log('BucketRemove Sucsses');
		callback(err, res);
	});
};


//ユーザー管理時の情報取得（ルーティング用）
CouchbaseCnt.prototype.ShowKeyContent2 = function(Key, callback){
	BucketLogin.get(Key, function(err, json){
		if(err){
			console.log('Bucket get failed:' + err);
			callback(err, json);
			return;
		}
		console.log('Bucket get sucsses');
		callback(err, json.value);
	});
};
module.exports = CouchbaseCnt;
