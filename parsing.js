var fs = require('fs');
var util = require('util'); //per util.inspect
var jsonfile = require('jsonfile');

var threshold = 10; // threshold for y coordinate (line) just in case image is skewed.
                    // this is used for identifying each block of text are in the same line.
var thresholdXPct = 20; // threshold for x coordinate - just in case the result is a skewed box

fs.readFile('myjsonfile3.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {

    var json = JSON.parse(data);
    //console.log(util.inspect(json, false, null));

    myThreshold = 5;
    function fits(word, row){
      if(Math.abs(row.average_y-word.y)<myThreshold)
        return true;
      else
        return false;
    }

    var words = [];
    for(var page of json[0].fullTextAnnotation.pages){
      for(var block of page.blocks){
        for(var paragraph of block.paragraphs){
          for(var word of paragraph.words){
            var newWord = { text: "", y: -1};
            for(var symbol of word.symbols){
              newWord.text += symbol.text;
            }
            newWord.y = symbol.boundingBox.vertices[2].y;
            words.push(newWord);
          }
        }
      }
    }



    function updateCoord(row) {
      var sum = 0;
      var count = 0;
      for(var word of row.words) {
        sum += word.y;
        count++;
      }
      row.average_y = sum / count;
    }

    //righe[] = { words = new Array(), average_y = -1};

    var righe = new Array();
    var found;
    for(var word of words){
      found = false;
      for(var riga of righe){
        if(fits(word, riga)){
          found = true;
          riga.words.push(word);
          updateCoord(riga);
          break;
        }
      }
      if(!found){
        var tmp = new Array();
        tmp.push(word);
        righe.push({
          words: tmp,
          average_y: word.y
        });
      }
    }

    console.log(util.inspect(righe, false, null));

  } //else
});
