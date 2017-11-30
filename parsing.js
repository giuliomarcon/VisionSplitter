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

    // Controlla che la word ci stia (in altezza) nella row
    myThreshold = 5;
    function fits(word, row){
      if(Math.abs(row.average_y-word.y)<myThreshold)
        return true;
      else
        return false;
    }

    // Salva ogni parola nel giusto formato nel vettore words
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


    // Corrects eventual prospective problems making the average of words y coord
    function updateAverageHeight(row) {
      var sum = 0;
      var count = 0;
      for(var word of row.words) {
        sum += word.y;
        count++;
      }
      row.average_y = sum / count;
    }

    // Inserisce in righe i vari array di parole opportune
    var righe = new Array();
    var found;
    for(var word of words){
      found = false;
      for(var riga of righe){
        if(fits(word, riga)){
          found = true;
          riga.words.push(word);
          updateAverageHeight(riga);
          break;
        }
      }
      if(!found){
        var tmp = new Array();
        tmp.push(word);
        righe.push({
          words: tmp,
          average_y: word.y,
          isValid: false
        });
      }
    }

    // Setta isValid = true in caso words contenga un prezzo
    for(var riga of righe){
      var i = 0;
      for(var word of riga.words){
        if(!isNaN(word.text)){
          if(i == 2){
            riga.isValid = true;
            break;  // da prestare attenzione ai casi con due prezzi per singolo words
          }
          else
            i = 0;
          i++;
        }
        else if((word.text == "." || word.text == ",") && i == 1)
          i++;
        else
          i = 0;
      }
    }

    // Accorpamento di nome e relativo prezzo in un singolo item dell'array final
    var final = new Array();
    var i = 0;
    var lastRow = { words: new Array(), isValid: false };
    for(var riga of righe) {
      if (!riga.isValid){
        lastRow = riga;
        i = 1;
      }
      else if(i == 1 && riga.isValid){
        for(var row of riga.words){
          lastRow.words.push(row);
        }
        final.push(lastRow);
        console.log("Pusho in final lastrow:\n" + util.inspect(lastRow, false, null)); //TODO: REMOVE THIS
        i = 0;
      }
      else if (riga.isValid) {
        console.log("Ho già una riga pronta:\n" + util.inspect(riga,false,null)); //TODO: REMOVE THIS
        final.push(riga);
      }
    }

  } //else
});
