'use strict';

const express = require('express'); // do not change this line
const parser = require('body-parser'); // do not change this line
const fs = require('fs');
const { Datastore } = require('@google-cloud/datastore'); 

const server = express();
const datastore = new Datastore({
	projectId: 'mindless-notes'
});

server.use(parser.urlencoded({
	extended: true
}));

server.use('/resources', express.static(__dirname + '/resources'));

var globalData = [];

/**
 * the main page of the application, where all users land.
 * should just return a page with a submission form, as well
 * as links to a list of all notes.
 */
server.get('/', function(req, res) {
	var pageFragment = fs.readFileSync('resources/main.html', 'utf8');
	res.status(200)
	res.set({"Content-Type":"text/html"});
	res.send(pageFragment);
});

/**
 * this page creates a new note when POSTed to.
 * params include:
 *     title,
 *     body.
 */
server.post('/new', function(req, res) {
	var post = req.body;
	var date = new Date();
	var time = date.getTime();
	const key = datastore.key(['note', post['note-title']]);

	const data = {
		title: post['note-title'],
		body: post['note-body'],
		time: time
	}

	datastore.save({
	  key: key,
	  data: data
	});


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
	const query = datastore.createQuery(['note']).limit(100).order('time', { descending: true });
	var pageFragment = fs.readFileSync('resources/fragment.html', 'utf8');

	datastore.runQuery(query, function(err, entities, nextQuery) {
		if (err) {
		  console.log(err);
		  return;
		}
		var dataLen = entities.length;
		var addFragment = '';

		for(var i = 0; i < dataLen; i++) {
			addFragment += '\t\t<div class="card-body border border-primary rounded">\n'
			addFragment += '\t\t\t<h2>' + entities[i]['title'] + '</h2>\n'
			addFragment += '\t\t\t<p>' + entities[i]['body'] + '</p>\n'
			addFragment += '\t\t</div>\n';
			pageFragment += addFragment;
			addFragment = '';
		}

		pageFragment += '\t\</div>\n\t</body>\n</html>'

		res.status(200)
		res.set({"Content-Type":"text/html"});
		res.send(pageFragment);
		});
});

/**
 * This has a parameter as well as a query string, and should query the 
 * database for said string.
 */
server.get('/search/:parameters', function(req, res) {
	var search_query = decodeURI(req.params['parameters']);
	var pageFragment = fs.readFileSync('resources/fragment.html', 'utf8');

	const query = datastore.createQuery('note').filter('title', '=', search_query)
		.limit(100);

	datastore.runQuery(query, function(err, entities, nextQuery) {
		if (err) {
		  return;
		}

		var dataLen = entities.length;
		var addFragment = '';

		for(var i = 0; i < dataLen; i++) {
			addFragment += '\t\t<div class="card-body border border-primary rounded">\n'
			addFragment += '\t\t\t<h2>' + entities[i]['title'] + '</h2>\n'
			addFragment += '\t\t\t<p>' + entities[i]['body'] + '</p>\n'
			addFragment += '\t\t</div>\n';
			pageFragment += addFragment;
			addFragment = '';
		}

		if(dataLen == 0) {
			pageFragment += '<div class="card-body border border-primary rounded"><p>no results found</p></div>\n'
		}

		pageFragment += '\t\</div>\n\t</body>\n</html>';

		res.status(200)
		res.set({"Content-Type":"text/html"});
		res.send(pageFragment);
		});
});

/**
 * our 404 page. says "not all who wander are lost. Don't you think is might be a little more than wandering though?"
 */
server.get('*', function(req, res) {
	var pageFragment = fs.readFileSync('/resources/lost.html', 'utf8');
	res.status(200)
	res.set({"Content-Type":"text/html"});
	res.send(pageFragment);
});

server.listen(process.env.PORT || 8080);
