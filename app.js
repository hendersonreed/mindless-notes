'use strict';

const express = require('express'); // do not change this line
const parser = require('body-parser'); // do not change this line
const fs = require('fs');
//const {Datastore} = requre('@googlecloud/datastore'); 

const server = express();
server.use(parser.urlencoded({
	extended: true
}));

var globalData = '';

/**
 * the main page of the application, where all users land.
 * should just return a page with a submission form, as well
 * as links to a list of all notes.
 */
server.get('/', function(req, res) {
	res.sendFile('resources/main.html', {
	'root': __dirname
	});
});

/**
 * this page creates a new note when POSTed to.
 * params include:
 *     title,
 *     body.
 */
server.post('/new', function(req, res) {
	var post = req.body;

	if (globalData == '') {
		globalData = post['note-title'] + ':' + post['note-body'];
	}
	else {
		globalData += '\n' + post['note-title'] + ':' + post['note-body'];
	}

	res.status(302)
	res.set({"Content-Type":"text/plain"});
	res.redirect("/");
});


/**
 * this should return a list of the titles and first lines of say 50 notes?
 */
server.get('/notes', function(req, res) {
	//thinking - load part of a page here into a string, and then append cards
	// containing notes to the string, and then close off the page before sending it.
	//
	// ok this definitely doesn't work. but that doesn't really matter, since it's just
	// for testing before I get a real database working with this.
	var pageFragment = fs.readFileSync('resources/fragment.html', 'utf8');

	var notes = globalData.split('\n');
	var noteLen = notes.length;
	var addFragment = '';

	for(var i = 0; i < noteLen && i < 50; i++) {
		addFragment += '<div class="card-body border border-primary rounded">\n'
		addFragment += '<h2>' + notes[i].split(':')[0] + '</h2>\n'
		addFragment += '<p>' + notes[i].split(':')[1] + '</p>\n'
		addFragment += '</div>';
		pageFragment += addFragment;
	}

	pageFragment += '</div></div></div></body></html>'

	res.status(200)
	res.set({"Content-Type":"text/html"});
	res.send(pageFragment);
});

/**
 * This has a parameter as well as a query string, and should query the 
 * database for said string.
 */
server.get('/notes/search/:parameters', function(req, res) {
	res.send("placeholder");
});

/**
 * our 404 page. says "not all who wander are lost. Don't you think is might be a little more than wandering though?"
 */
server.get('*', function(req, res) {
	res.sendFile('resources/lost.html', {
		'root': __dirname
	});
});

server.listen(process.env.PORT || 8080);
