//Libraries
const http = require('http');
const express = require('express');
const opn = require('opn');
var multer = require('multer');
var bodyParser = require('body-parser');
const app = express();

const PORT = 3000;
const APIKEY = 'AIzaSyB8D-q0yx_xa4hl0EtFX1PtHkn9mDn_CeI';
var url = "https://vision.googleapis.com/v1/images:annotate?key=" + APIKEY;
var tipo_riconoscimento = "TEXT_DETECTION";

app.use(bodyParser.json());
//app.use(express.static('views'));

app.get('/',function(req, res) {
	if(res.data)
});

app.listen(PORT,function(){
	console.log('listening on port '+PORT);
});

opn('http://localhost:'+PORT+'/form.html');
