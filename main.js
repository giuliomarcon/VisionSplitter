const PORT = 1337;
//aaaaa
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
var gd = require('node-gd');

var app = express();

app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html' });

    res.write('<!DOCTYPE HTML><html><body>');
    res.write('<img width="500" src="' + base64Image(req.file.path) + '"><br>');

    /*var json;
    fs.readFile('myjsonfile.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        var obj = JSON.parse(data); //now it an object
        obj.table.push({id: 2, square:3}); //add some data
        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back
    }});*/

    gd.openFile('./uploads/delsytest', function(err, img) {
      if (err) {
        throw err;
      }

      img.emboss();
      img.brightness(75);
      img.saveFile('./uploads/delsytestNEW', function(err) {
        img.destroy();
        if (err) {
          throw err;
        }
      });
    });

    res.end('</body></html>');
}).listen(PORT);

console.log('Server running at http://localhost:'+PORT);
opn('http://localhost:'+PORT+'/');		//apre sul browser

function base64Image(src) {
  var data = fs.readFileSync(src).toString('base64');
  return util.format('data:%s;base64,%s', mime.lookup(src), data);
}
