const PORT = 1337;

var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var util = require('util');
var jsonfile = require('jsonfile');
var opn = require('opn');

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

var bodyParser = require('body-parser');

var parser = require('./lib/parsing.js');

var fname = "";

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/public/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    fname = file.name;
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end(fname);
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.post('/recognition', function(req, res){
  client.documentTextDetection(path.join("public/uploads/", req.body.image))
    .then((results) => {
        fs.writeFile('assets/json/'+new Date().getTime()+'.json', results, 'utf8', function(){});
        var out = parser.analyzeReceipt(results);
        res.end(JSON.stringify(out));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });

});

var server = app.listen(PORT, function(){
  console.log('Server listening on port '+PORT);
  opn('http://localhost:'+PORT+'/', {app: ['chrome', '--incognito']});
});
