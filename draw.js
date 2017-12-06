var fs = require('fs');
var util = require('util');
var jsonfile = require('jsonfile');
const { createCanvas, loadImage } = require('canvas');


loadImage('./assets/receipts/sconto.jpg').then((image) => {
  fs.readFile('./assets/json/1512510353341.json', 'utf8', function (err, data) {
      if (err)
        throw err;
  });
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0, image.width, image.height)
  ctx.strokeStyle('rgba(255,0,0,0.8)')
  ctx.rect('50,50,100,100')
  ctx.stroke();

  fs.writeFile('out.svg', canvas.toBuffer());

  console.log('<img src="' + canvas.toDataURL() + '" />')
});

/*
C:\Users\tron\Documents\GitHub\VisionSplitter>node draw.js
undefined:1
[object Object]
 ^

SyntaxError: Unexpected token o in JSON at position 1
    at JSON.parse (<anonymous>)
    at C:\Users\tron\Documents\GitHub\VisionSplitter\draw.js:7:22
    at FSReqWrap.readFileAfterClose [as oncomplete] (fs.js:528:3)
*/
