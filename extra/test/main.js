const opn = require('opn');     //per aprire il browser
const http = require('http');   //per aprire il server
const url = require('url') ;    //per pigliare l'url
const fs = require('fs');     //per il filesystem
const jade = require('jade');

var APIKEY = 'AIzaSyB8D-q0yx_xa4hl0EtFX1PtHkn9mDn_CeI';
var google_url = "https://vision.googleapis.com/v1/images:annotate?key=" + APIKEY;
var tipo_riconoscimento = "TEXT_DETECTION";

var json_request =
  {
    "requests": [
    {
      "image": {
                "content":"' . $image_base64. '"
              },
              "features": [
                  {
                    "type": "' .$tipo_riconoscimento. '",
                "maxResults": 200
                  }
              ]
            }
          ]
        };

var options = {
  host: 'www.google.com',
  port: 80,
  path: '/upload',
  method: 'POST'
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();