var fs = require('fs');
var util = require('util');
var jsonfile = require('jsonfile');

fs.readFile('myjsonfile.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    var json = JSON.parse(data); //now it an object
    //console.log(util.inspect(json, false, null));
    //0 {} fullTextAnnotation [] pages [] 0 {} blocks [] 0 {} paragraphs [] 0 {} words []
 //json[0].fullTextAnnotation
    console.log(json[0].fullTextAnnotation.pages[0].blocks[0].paragraphs[0].words[0].symbols[0].text);


    var myString = "";
    for(var page of json[0].fullTextAnnotation.pages){
      myString = myString + "Inizio Pagina\n";
      for(var block of page.blocks){
        myString = myString + "Inizio Blocco\n";
        for(var paragraph of block.paragraphs){
          myString = myString + "Inizio Paragrafo\n";
          for(var word of paragraph.words){
            for(var symbol of word.symbols){
              myString = myString + symbol.text;
            }
            myString = myString + " ";
          }
          myString = myString + "\nFine Paragrafo\n";
        }
        myString = myString + "Fine Blocco\n";
        myString = myString + "\n";
      }
      myString = myString + "Fine Pagina\n";
    }

    console.log(myString);

}});
