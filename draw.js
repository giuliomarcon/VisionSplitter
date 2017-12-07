var fs = require('fs');
var util = require('util');
var jsonfile = require('jsonfile');
var path = require('path');

const { registerFont, createCanvas, loadImage } = require('canvas')
registerFont('./assets/Roboto-Bold.ttf', {family: 'My Font'});

// Draw cat with lime helmet
loadImage('./public/uploads/sconto.jpg').then((image) => {

  fs.readFile('./assets/1512661714002.json', 'utf8', function (err, data) {
      if (err)
        throw err;


      var results = JSON.parse(data);

      const canvas = createCanvas(image.width, image.height)
      const ctx = canvas.getContext('2d')

      //console.log("w: " + image.width +", h:"+ image.height);

      ctx.drawImage(image, 0, 0, image.width, image.height)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.shadowColor='rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'red'
      for(var box of results[0].textAnnotations){
        var vortex = box.boundingPoly.vertices;

        ctx.beginPath();
        ctx.lineTo(vortex[0].x,vortex[0].y);
        ctx.lineTo(vortex[1].x,vortex[1].y);
        ctx.lineTo(vortex[2].x,vortex[2].y);
        ctx.lineTo(vortex[3].x,vortex[3].y);
        ctx.lineTo(vortex[0].x,vortex[0].y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.lineWidth = 2;
      for(var box of results[0].textAnnotations){

        var vortex = box.boundingPoly.vertices;
        var boxLength =  vortex[1].x-vortex[0].x;
        var boxHeight =  vortex[2].y-vortex[1].y;

        if(box.description.length < 15 ){
          ctx.font = 'bold '+boxHeight*5/9+'px "My Font"';
          ctx.shadowBlur=8;
          ctx.strokeText(box.description.toUpperCase(), vortex[0].x+boxLength*0.01, vortex[0].y+boxHeight*2/3);
          //ctx.shadowBlur=0;
          ctx.fillText(box.description.toUpperCase(),  vortex[0].x+boxLength*0.01, vortex[0].y+boxHeight*2/3);
        }

      }



      //console.log('<img src="' + canvas.toDataURL() + '" />')
      fs.writeFile('file.jpg', canvas.toBuffer());
  });


  //console.log('<img src="' + canvas.toDataURL() + '" />')
})
/*
// Draw cat with lime helmet
loadImage('./assets/receipts/sconto.jpg').then((image) => {


});
*/




/*

foreach($risposta['responses'][0]['textAnnotations'] as $box){

  $punti = array();

  foreach($box['boundingPoly']['vertices'] as $vertice){
    array_push($punti, $vertice['x'], $vertice['y']);
    }

  imagesetthickness($im, 6);
  imagepolygon($im, $punti, count($box['boundingPoly']['vertices']), $rosso);

  }

  */

/*
loadImage('./assets/receipts/sconto.jpg').then((image) => {
  fs.readFile('./assets/json/1512510353341.json', 'utf8', function (err, data) {
      if (err)
        throw err;
  });
});
*/




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
