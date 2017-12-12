const PORT = process.env.PORT || 5000;

var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var util = require('util');
var jsonfile = require('jsonfile');
var opn = require('opn');
var Jimp = require("jimp");

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

var bodyParser = require('body-parser');

var parser = require('./lib/parsing.js');

var fname = "";
var fpath = "";

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
    fpath = path.join(form.uploadDir, file.name);
    fs.rename(file.path, fpath);

    fname = file.name;
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the clientx  
  form.on('end', function() {
    // resize
    Jimp.read(fpath, function (err, img) {
    if (err) throw err;
    img.exifRotate() // rotate
        .resize(720, Jimp.AUTO)            // resize
        .quality(100)                 // set JPEG quality
        .write(fpath); // save
    
    res.end(fname);
    });    
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.post('/recognition', function(req, res){
  var filepath = path.join("public/uploads/", req.body.image);
  client.documentTextDetection(filepath)
    .then((results) => {
        fs.writeFile('assets/json/'+new Date().getTime()+'.json', results, 'utf8', function(){});
        var out = parser.analyzeReceipt(results);
        res.end(JSON.stringify(out));
        fs.unlinkSync(filepath);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });

});

app.post('/api/recognition', function(req, res){
  
  // upload
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.uploadDir = path.join(__dirname, '/public/uploads');
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    fname = file.name;
  });

  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('end', function() {
    // recognition
    var filepath = path.join("public/uploads/", fname);
    client.documentTextDetection(filepath)
      .then((results) => {
          fs.writeFile('assets/json/'+new Date().getTime()+'.json', results, 'utf8', function(){});
          var out = parser.analyzeReceipt(results);
          res.end(JSON.stringify(out));
          fs.unlinkSync(filepath);
      })
      .catch((err) => {
        console.error('ERROR:', err);
      });    

  });

  form.parse(req);

});

app.post('/api/split', function(req, res){
  var oggetti = JSON.parse(req.body.items);
  var membri = JSON.parse(req.body.members);

  var out = []

  var total = 0;
  oggetti.forEach(function(feature) {
      total += parseFloat(feature.price);
  });

  membri.forEach(function(i) {
    var tot_persona = 0;
      oggetti.forEach(function(j) {
        if (i.isking == 0) // se non è il king che ha pagato tutto
        {
          if (j.person.indexOf(i.name) != -1 || j.person.indexOf("Tutti") != -1) { // se l'oggetto è assegnato alla persona in considerazione oppure a tutti
            var money = 0;
            if (j.person.indexOf("Tutti") != -1)
              money = parseFloat(j.price || 0) / parseFloat(membri.length);
            else
              money = parseFloat(j.price || 0) / parseFloat(j.person.length);

            tot_persona += money;
          }
        }
    });

      tot_persona = tot_persona || 0;
      out.push({name: i.name, total: tot_persona.toFixed(2)});
  });

  res.end(JSON.stringify(out));
});

var server = app.listen(PORT, function(){
  console.log('Server listening on port '+PORT);
});
