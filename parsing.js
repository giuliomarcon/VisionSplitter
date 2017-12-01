var fs = require('fs');
var util = require('util'); //per util.inspect
var jsonfile = require('jsonfile');
var levenshtein = require('./fast-levenshtein-master/levenshtein.js');

fs.readFile('myjsonfile4.json', 'utf8', function readFileCallback(err, data){
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
      row.average_y = Math.round((sum / count) * 10) / 10;
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
          isValid: false,
          price: null
        });
      }
    }

    // Setta isValid = true in caso words contenga un prezzo
    for(var riga of righe){
      var i = 0;
      var whole, decimal;
      for(var word of riga.words){
        if(!isNaN(word.text)){  //se è un numero
          if (i == 0 || i == 1) {
            whole = word.text;
            i = 1;
          }
          if(i == 2){
            riga.isValid = true;
            decimal = word.text;
            riga.price = parseFloat(whole + "." + decimal);
            break;  // da prestare attenzione ai casi con due prezzi per singolo words
          }
        }
        else if((word.text == "." || word.text == ",") && i == 1)
          i++;
        else
          i = 0;
      }
    }

    // Accorpamento di nome e relativo prezzo in un singolo item dell'array mergedRows
    var mergedRows = new Array();
    var i = 0;
    var lastRow = { words: new Array(), isValid: false, price: null, title: "" };
    for(var riga of righe) {
      if (!riga.isValid){
        lastRow = riga;
        i = 1;
      }
      else if(i == 1 && riga.isValid){ // è il caso di accorpare

        for(var word of riga.words){
          lastRow.words.push(word);
        }
        lastRow.price = riga.price;
        lastRow.isValid = true;
        mergedRows.push(lastRow);
        i = 0;
      }
      else if (riga.isValid) {
        mergedRows.push(riga);
      }
    }

    // Ordina le righe già accorpate in base all'altezza per riconoscere bene gli sconti
    mergedRows.sort(function(a, b) {
      return parseFloat(a.average_y) - parseFloat(b.average_y);
    });

    // Controlla se la riga contiene uno sconto
    function isDiscount(row){
      var found = false;
      for(var word of row.words){
        if(levenshtein.get(word.text.toUpperCase(),'SCONTO') < 2){
          found = true;
          break;
        }
      }
      return found;
    }

    //Corregge i prezzi in caso rilevi sconto su riga inferiore
    var final = new Array();
    var lastRow = mergedRows[0]; //check se è vuoto?
    for(var i = 1; i < mergedRows.length; i++){
      if(isDiscount(mergedRows[i])) {
        lastRow.price = lastRow.price - Math.abs(mergedRows[i].price); //abs just in case
        final.push(lastRow);
        i++;
      }
      else {
        final.push(lastRow);
      }
      lastRow = mergedRows[i];
    }
    final.push(lastRow);

    //Controllo totale
    var total;
    var found = false;
    var i = 0;
    for(var row of final) {
      for(var word of row.words) {
        if (levenshtein.get(word.text.toUpperCase(),'TOTALE') < 2) {
            total = row.price;
            found = true;
        }
      }
      if (found) break;
      i++;
    }
    if (found)
      final = final.slice(0, i);

    console.log(" TOTALE: " + total);

    //Controllo consistenza dati
    var checkSum = 0;
    for (var row of final) {
      checkSum = checkSum + row.price;
    }
    if (checkSum == total)
      console.log("Dati consistenti");
    else
      console.log("Dati NON consistenti");


    console.log(util.inspect(final, false, null));
  } //else
});
