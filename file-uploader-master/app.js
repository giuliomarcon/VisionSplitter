var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var util = require('util');
var jsonfile = require('jsonfile');

const Vision = require('@google-cloud/vision');
const vision = new Vision();

var bodyParser = require('body-parser');

var parser = require('../libs/parsing.js');

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
  console.log(req.body.image);

  vision.documentTextDetection({ source: { filename: path.join("file-uploader-master/public/uploads/", req.body.image) } })
    .then((results) => {
        var out = parser.analyzeReceipt(results);
        res.end(JSON.stringify(out));
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
