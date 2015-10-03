require('date-utils');
var crypto = require("crypto");

var BizBird = function(){};

//保守作業履歴検索での動作
BizBird.prototype.MaintenanceSearch = function(json, View, callback){
	var iSdate = 0;
	var iEdate = 1;
	var iTitle = 2;
	var iWorker = 3;
	var iClassification = 4;
	var iContent = 5;
	var imyID = 7;
	var jsonarray = new Array();
	var arraynum = 0;
	for(var i = 0; i < View.length && i < 100; i++){
		//日付が範囲内にあれば
		if(!(View[i].value[iSdate] > json.enddate || View[i].value[iEdate] < json.startdate)){
			for(var ix = 0; ix < View[i].value[iClassification].length; ix++){
				//分類に同じものがあるならば
				if(View[i].value[iClassification][ix] === json.classification || json.classification === 'none'){
					var createjson = {
						id: View[i].value[imyID],
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
						//本文に検索文字がヒットしたら、前10文字と後10文字を表示させる
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
					if(createjson.content || !json.content){
						jsonarray[arraynum] = createjson; 
						arraynum++;
						break;
					}
				}
			}
		}
	}
	callback(jsonarray)
};

//情報検索での動作
BizBird.prototype.InfoSearch = function(json, ParentView, ChildView, callback){
	var jsonarray = new Array();
	for(var PView of ParentView){
		PView.value.child =[];
		for(var CView of ChildView){
			if(PView.value.myID == CView.value.parentNo){
				PView.value.child.push(CView.value);
			}
		}
	}
	var jsonView = new Array();
	for(var searchView of ParentView){
		var insertflg = false;
		if(searchView.value.createdate >= json.start_date && searchView.value.createdate <= json.end_date){
			if(json.Info_important === searchView.value.Info_important || json.Info_important === "false"){
				if(json.Info_attention === searchView.value.Info_attention || json.Info_attention === "false"){
					if(searchView.value.Info_content.indexOf(json.contents) >= 0 || searchView.value.Info_title.indexOf(json.contets) >= 0 ){
						insertflg = true;
					}
				}
			}
		}
			if(!insertflg){
			for(var searchChildView of searchView.value.child){
				if(searchChildView.createdate >= json.start_date && searchChildView.createdate <= json.end_date){
					if(json.Info_important === searchChildView.Info_important || json.Info_important === "false"){
						if(json.Info_attention === searchChildView.Info_attention || json.Info_attention === "false"){
							if(searchChildView.Info_content.indexOf(json.contents) >= 0 || searchChildView.Info_title.indexOf(json.contets) >= 0){
								insertflg = true;
							}
						}
					}
				}
			}
		}
		if(insertflg){
			jsonView.push(searchView);
		}
	}
	callback(jsonView)
};


//ログインチェックの関数
BizBird.prototype.loginCheck = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};




//パスワードのハッシュを作成する
BizBird.prototype.hashPassword = function(password) {

var sha512 = crypto.createHash('sha512');
sha512.update(password)
password = sha512.digest('hex')

return password;
}



module.exports = BizBird;