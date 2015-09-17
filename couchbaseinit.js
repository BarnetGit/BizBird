var Couchbase = require('couchbase');
var Cluster = new Couchbase.Cluster('couchbase://***.***.***.***:****');
var Bucket = Cluster.openBucket('serviceReport');
var BucketSec = Cluster.openBucket('security');
var BucketLogin = Cluster.openBucket('Login');
var BucketMgr = Bucket.manager();
var BucketMgrLogin = BucketLogin.manager();

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
	}else{
		console.log("すでにArticleIDは存在しています");
	}
});

var ddocdatamain = {
	views: {
		SearchDate: {
			map: ['function (doc, meta) {',
				  	'if(doc.type == "Maintenance"){',
  				  	  'emit(doc.Maintenance_startdate, [doc.Maintenance_startdate, doc.Maintenance_enddate, doc.Maintenance_title, doc.Maintenance_worker, doc.Maintenance_classification, doc.Maintenance_content, doc.createdate, doc.myID]);',
				    '}',
				  '}'
			].join('\n')
		},
		SearchWorker:{
			map: ['function (doc, meta) {',
					'if(doc.type == "Maintenance"){',
						'emit(doc.Maintenance_worker, [doc.Maintenance_startdate, doc.Maintenance_enddate, doc.Maintenance_title, doc.Maintenance_worker, doc.Maintenance_classification, doc.Maintenance_content]);',
  					'}',
				  '}'
			].join('\n')
		},
	}
};

var ddocdatainfo = {
	views: {
		NewDate: {
			map: ['function (doc, meta) {',
				  	'if(doc.type == "Share"){',
  				  	  'emit(doc.createdate, [doc.createdate, doc.Info_title]);',
				    '}',
				  '}'
			].join('\n')
		},
		child:{
			map: ['function (doc, meta) {',
					'if(doc.type == "Share" && doc.relationship == "child"){',
						'emit(doc.createdate, doc);',
  					'}',
				  '}'
			].join('\n')
		},
		parent:{
			map: ['function (doc, meta) {',
					'if(doc.type == "Share" && doc.relationship == "parent"){',
						'emit(doc.createdate, doc);',
  					'}',
				  '}'
			].join('\n')
		},
	}
};

var ddocdatalogin = {
	views: {
		ViewLoginCheck: {
			map: ['function (doc, meta) {',
  				  	  'emit(doc.id, doc.password);',
				  '}'
			].join('\n')
		},
	}
};

BucketMgr.upsertDesignDocument('Maintenance', ddocdatamain, function(err){
	BucketMgr.upsertDesignDocument('info_share', ddocdatainfo, function(err){
		BucketMgrLogin.upsertDesignDocument('logincheck', ddocdatalogin, function(err){
			console.log(err);
			console.log("初期設定終了Ctrl+Cで戻ってください");
		});
	});
});

