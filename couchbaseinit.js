var Couchbase = require('couchbase');
var Cluster = new Couchbase.Cluster('couchbase://***.***.**.***:****');
var Bucket = Cluster.openBucket('serviceReport');
var BucketSec = Cluster.openBucket('security');
var BucketMgr = Bucket.manager();

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

var ddocdata = {
	views: {
		SearchDate: {
			map: ['function (doc, meta) {',
				  	'if(doc.type == "Maintenance"){',
  				  	  'emit(doc.Maintenance_startdate, [doc.Maintenance_startdate, doc.Maintenance_enddate, doc.Maintenance_title, doc.Maintenance_worker, doc.Maintenance_classification, doc.Maintenance_content]);',
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

BucketMgr.upsertDesignDocument('Maintenance', ddocdata, function(err){
	console.log(err);
	console.log("初期設定終了Ctrl+Cで戻ってください");
});

