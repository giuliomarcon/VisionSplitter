/*
* Module dependencies.
*/
var express       = require('express')
    , fs          = require('fs')
    , http        = require('http')
    , util        = require('util')
    , path        = require('path')
    , favicon     = require('serve-favicon')
    , bodyParser  = require('body-parser')
    , methodOverride = require('method-override');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(express.logger('dev'));
app.use(bodyParser({ keepExtensions: true, uploadDir: __dirname + '/public/uploads' }));
app.use(methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(__dirname + '/static'));
app.use(express.errorHandler());

//File upload
app.get('/upload', common.imageForm);
app.post('/upload', common.uploadImage);


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
