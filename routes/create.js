var express = 		require('express')
  ,	couchbase = 	require('./couchbase')
  , bizbird =		require('./bizbird')
				 	require('date-utils');
				 	
var CouchCnt = new couchbase();
var BizBird = new bizbird();

var app = express.Router();

//�o�^
app.post('/', function(req, res){
	var json = req.body;
	var IDname = 'LoginID';
	//�O����
	//�d���`�F�b�N
	CouchCnt.authenticate('logincheck', 'ViewLoginCheck', function(err,View){
		for(var LView of View){
			if(LView.key == json.id){
				res.render('err', {title: '�G���[', err: '�F�؃G���['});
				return;
			}
		}
	});
	
	//�n�b�V����
	json.password = BizBird.hashPassword(json.password);

	//DB�o�^�̊֐��Ă�
	CouchCnt.save(json, IDname, function(err, result){
		if(err){
			res.render('err', {title: '�G���[', err: '�f�[�^�x�[�X�o�^�G���['});
			return;
		}
	});
	res.render('login', {title: '���O�C�����'});
	return;
});

app.get('/', function(req, res){
	res.render('register');
});

module.exports = app;