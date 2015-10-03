var log4js = require('log4js');
var logger = exports = module.exports = {};
log4js.configure({
     appenders: [
         {
             "type": "dateFile",
             "category": "request",
             "filename": "./logs/request.log",
             "pattern": "-yyyy-MM-dd",
             "backups": 30,
             "MaxFileSize": "1MB"
         },
         
    ]
});

logger.request = log4js.getLogger('request');