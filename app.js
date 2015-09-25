var express = 		require('express')
var path = require('path');
var cookieParser = require('cookie-parser')
,	bodyParser = 	require('body-parser')
  , session = require('express-session')
  ,	couchbase = 	require('./routes/couchbase')
  , bizbird = 		require('./routes/bizbird')
  , helmet =		require('helmet');
				 	require('date-utils');

var routes = require('./routes/index');
var maintenance = require('./routes/maintenance');
var info = require('./routes/info');
var tool = require('./routes/tool');
var login = require('./routes/login');
var create = require('./routes/create');


var CouchCnt = new couchbase();
var BizBird = new bizbird();
var app = express();
var nowyear = new Date().toFormat("YYYY");


app.use(helmet());
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use(bodyParser.urlencoded({extended: true}));



app.use(cookieParser());
app.use(session({
  secret: 'toddleBizBird',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge:24 * 60 *  60 * 1000 // one day.
  }
}));


//Viewエンジンセット
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use('/login', login);
app.use('/', BizBird.loginCheck, routes);
app.use('/create', create);
app.use('/maintenance', maintenance);
app.use('/info', info);
app.use('/tool', tool);


app.get('*', function(req, res){
	res.render('err', {title: 'エラー', err: '存在しないページです'});
});

app.listen(8080);