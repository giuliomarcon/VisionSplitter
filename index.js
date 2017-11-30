const PORT = 1337;

var express = require('express');
var fs = require('fs');
var util = require('util');
var mime = require('mime');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var path = require('path');
var opn = require('opn');			                // Per aprire il browser
var Vision = require('@google-cloud/vision'); // Imports the Google Cloud client library
var vision = new Vision();                    // Creates a client
var util = require('util');
var jsonfile = require('jsonfile');

var app = express();

var form = '<!DOCTYPE HTML><html><body>' +  // Simple upload form
  "<form method='post' action='/upload' enctype='multipart/form-data'>" +
  "<input type='file' name='image'/>" +
  "<input type='submit' /></form>" +
  '</body></html>';

app.get('/', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(form);
}).listen(PORT);

app.post('/upload', upload.single('image'), function(req, res, next) { // Get the uploaded image, Image is uploaded to req.file.path
  res.write('<!DOCTYPE HTML><html><body>');
  console.log("roba: " +req.file.path);
  // Read a local image as a text document
  vision.textDetection({ source: { filename: req.file.path } })
    .then((results) => {

      res.write('<img width="500" src="' + base64Image(req.file.path) + '"><br>');
      console.log(util.inspect(results, false, null));
      const fullTextAnnotation = results[0].fullTextAnnotation;

      var json = JSON.stringify(results);
      fs.writeFile('./myjsonfile2.json', json, 'utf8');
/*
      for(let box of results[0].textAnnotations){
        var points = [];
        for(let vertex of box.boundingPoly.vertices){
          points.push(vertex.x,vertex.y);
          console.log(vertex.x+"-"+vertex.y)
        }
      }
      console.log(fullTextAnnotation.text);
      res.write(fullTextAnnotation.text);*/
      res.end('</body></html>');
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });

});

console.log('Server running at http://localhost:'+PORT);
opn('http://localhost:'+PORT+'/');		//apre sul browser

function base64Image(src) {
  var data = fs.readFileSync(src).toString('base64');
  return util.format('data:%s;base64,%s', mime.lookup(src), data);
}
