var fs = require('fs');
var util = require('util'); //per util.inspect
var jsonfile = require('jsonfile');
var levenshtein = require('./fast-levenshtein-master/levenshtein.js');

const PIXEL_THRESHOLD = 5;
const PRECISION = 10;
const JSON_FILE = 'myjsonfile4.json';
const LEVENSHTEIN = 2;

// Controlla che la word ci stia (in altezza) nella row
function fits(word, row){
  if(Math.abs(row.average_y-word.y)< PIXEL_THRESHOLD)
    return true;
  else
    return false;
}

// Ricalcola da zero e aggiorna l'altezza media della row
function updateAverageHeight(row) {
  var sum = 0;
  var count = 0;
  for(var word of row.words) {
    sum += word.y;
    count++;
  }
  row.average_y = Math.round((sum / count) * PRECISION) / PRECISION;
}

// Controlla se la riga contiene uno sconto
function isDiscount(row){
  var found = false;
  for(var word of row.words){
    if(levenshtein.get(word.text.toUpperCase(),'SCONTO') < LEVENSHTEIN){
      found = true;
      break;
    }
  }
  return found;
}

function printRow(rows){
  for(var row of rows){
    process.stdout.write("\nProdotto: ");
    for(var word of row.words) {
      process.stdout.write(word.text + " ");
    }
    console.log("\nPrezzo finale: " + row.price);
  }
}

fs.readFile(JSON_FILE, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {

    var json = JSON.parse(data);

    // Salva ogni parola in formato stringa nel vettore words
    var words = [];
    for(var page of json[0].fullTextAnnotation.pages){
      for(var block of page.blocks){
        for(var paragraph of block.paragraphs){
          for(var word of paragraph.words){
            var wordString = { text: "" };
            for(var symbol of word.symbols){
              wordString.text += symbol.text;
            }
            wordString.y = symbol.boundingBox.vertices[2].y;
            words.push(wordString);
          }
        }
      }
    }

    // Inserisce in rows i vari array di parole opportune
    var rows = [], found;
    for(var word of words){
      found = false;
      for(var row of rows){
        if(fits(word, row)){
          found = true;
          row.words.push(word);
          updateAverageHeight(row);
          break;
        }
      }
      if(!found){
        var tmp = [];
        tmp.push(word);
        rows.push({
          words: tmp,
          average_y: word.y,
          isValid: false,
          price: null
        });
      }
    }

    // Setta isValid della row a 'true' in caso words contenga un prezzo
    for(var row of rows){
      var i = 0, whole, decimal;
      for(var word of row.words){
        if(!isNaN(word.text)){  //se è un numero
          if (i == 0 || i == 1) {
            whole = word.text;
            i = 1;
          }
          if(i == 2){
            row.isValid = true;
            decimal = word.text;
            row.price = parseFloat(whole + "." + decimal);
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
    var mergedRows = [], i = 0,
    lastRow = {
        words: [],
        isValid: false,
        price: null,
        title: ""
      };
    for(var row of rows) {
      if (!row.isValid){
        lastRow = row;
        i = 1;
      }
      else if(i == 1 && row.isValid){ // è il caso di accorpare
        for(var word of row.words){
          lastRow.words.push(word);
        }
        lastRow.price = row.price;
        lastRow.isValid = true;
        mergedRows.push(lastRow);
        i = 0;
      }
      else if (row.isValid) {
        mergedRows.push(row);
      }
    }

    // Ordina le righe già accorpate in base all'altezza per riconoscere bene gli sconti
    mergedRows.sort(function(a, b) {
      return parseFloat(a.average_y) - parseFloat(b.average_y);
    });

    //Corregge i prezzi in caso rilevi sconto su riga inferiore
    var final = [], lastRow = (mergedRows.length!=0?mergedRows[0]:null);
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
    var total, found = false, i = 0;
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
    if (checkSum == total){
        console.log("Dati consistenti");
        printRow(final);
    }
    else
      console.log("Dati NON consistenti");

    /*
    // Debug completo
    console.log(util.inspect(final, false, null));
    */

}});
