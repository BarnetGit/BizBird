var Couchbase = require('couchbase');
var Cluster = new Couchbase.Cluster('couchbase://***.***.***.***:****');
var Bucket = Cluster.openBucket('serviceReport');
var BucketSec = Cluster.openBucket('security');

var CouchbaseCnt = function(){
};

//カウチベースに登録
CouchbaseCnt.prototype.save = function(json, idname, callback){
	var Incremental = 1
	//カウチベース内でのインクリメント（++）操作
	BucketSec.counter(idname, Incremental, function(err,couchid){
		if(err){
			console.log('インクリメントエラー' + err);
			callback(err,res);
			return;
		}
		var Key = couchid.value;
		Bucket.insert(Key.toString(), json, function(err,res){
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
CouchbaseCnt.prototype.getView = function(devname, viewname, Order, callback){
	var ViewQuery = Couchbase.ViewQuery;
	//order 1=昇順 2=降順
	var query = ViewQuery.from(devname, viewname).order(Order).limit(100);
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

module.exports = CouchbaseCnt;