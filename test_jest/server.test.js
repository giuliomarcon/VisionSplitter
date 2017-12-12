const parser = require('../lib/parsing.js');
const jsonfile = require('jsonfile');
const fs = require('fs');

test('The google API should not change its json result for the same image', () => {
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  client.documentTextDetection('./test_jest/anonimo_sconto.jpg')
    .then((results) => {
      fs.readFile('./test_jest/anonimo_sconto_google.json', 'utf8', function (error, data) {
          if (error)
            throw error;
          expect(results).toEqual(JSON.parse(data));
      });
    })
    .catch((err) => {
      console.error('Google response error, JEST could not proceed to the testing phase', err);
    });
});
/*
test('"updateAverageHeight" should throw a TypeError exception if a empty object is given', () => {
  expect(parser.updateAverageHeight({})).toThrow(Error);
});
*/
test('"fits" with a word with a y of 50px is about the same height as a row it should fit based on the threshold of ' + parser.PIXEL_THRESHOLD + 'px', () => {
  expect(parser.fits(
    {text: "yo", y: "50"},
    {words: [{text: "ayyy", y:"50"}], average_y: 50 }
  )).toBeTruthy();
});

test('if a word has an offset to the row greather than the thereshold of ' + parser.PIXEL_THRESHOLD + 'px such a word of y coord equals 10 and row with an y coord of 50 as it shoult return false', () => {
  expect(parser.fits(
    {text: "yo", y: "10"},
    {words: [{text: "hey", y:"50"}],average_y: 50}
  )).not.toBeTruthy();
});
