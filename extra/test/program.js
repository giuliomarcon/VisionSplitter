const opn = require('opn');			//per aprire il browser
const http = require('http');		//per aprire il server
const url = require('url') ;		//per pigliare l'url
//const fs = require('fs');			//per il filesystem
//const jade = require('jade');

//SERVER

var PORT = 3000;
http.createServer(function (request, response) {
	// You have access to the request and response objects here.

	var hostname = request.headers.host; 				// hostname = 'localhost:8080'
  	var pathname = url.parse(request.url).pathname; 	// pathname = '/MyApp'

	response.writeHead(200);									// write a 200 OK header
	response.write('<h1>'+pathname.substr(1)+'</h1>\n'); 		// write to the body
	response.end();

												// return the response to the user

	/*var template = jade.compileFile(__dirname+'/views/test.jade');
	template({name: "Davie Skitch Mulldoon"});*/

	/*var gulp = require('gulp'),jshint = require('gulp-jshint');
	gulp.task('assets:js', function () {
		return gulp.src(components.js).pipe(jshint()).pipe(jshint.reporter('default'))
	}*/

	/*
	console.log('Cartella corrente: '+__dirname);
	
	debugger;
	fs.readFile(__dirname+'/views/about.html', function (error,data) {

		if (error) {
		    if (error.code === 'ENOENT') {

				response.writeHead(200);
		      	console.error('il file non esiste');
		      	response.end();
		      	return;
		    }

		    throw error;
		}
		else{
			//console.log(data);
			response.writeHead(200);
			response.end(data);
		}

	});*/

}).listen(PORT);		//Decide la porta su cui ascoltare

/*
var Cat = require('./cat');
var tigger = new Cat();
console.log(tigger.legs)
tigger.sayHello();
*/
console.log('Server running at http://localhost:'+PORT);
opn('http://localhost:'+PORT+'/testurl');		//apre sul browser
