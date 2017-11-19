var Vision = require('@google-cloud/vision'); // Imports the Google Cloud client library
var vision = new Vision();                    // Creates a client

// Read a local image as a text document
vision.documentTextDetection({ source: { filename: 'extra/phptest/scontrino.jpg' } })
  .then((results) => {
    const fullTextAnnotation = results[0].fullTextAnnotation;
    console.log(fullTextAnnotation.text);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
