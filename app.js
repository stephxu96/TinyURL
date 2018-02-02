// app.js

// Express initialization
var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var http = require('http');
var url = require('url');
var bodyParser = require('body-parser');
var dotEnv = require('dotenv').config();
//const routes = require('./routes');
const portNum = process.env.PORT || 8080;

// Set up public path
app.use(express.static(__dirname + '/public'));

app.use(function(request, response, next) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up db connection
var MongoClient = require('mongodb').MongoClient;
var mongoUri = process.env.MONGODB_URL;
var db = MongoClient.connect(mongoUri, function(error, client) {
	if (error) {
		console.log("MongoClient connection failed.");
	} else {
		db = client.db('urlencodes');
		console.log("db connected");
	}
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/api', function(req, res) {
	if (!req.body) { 
		console.log("request body not represent");
		return res.sendStatus(400); 
	}
	convertUrl(req.body.url, res); 
});

app.use(/\/[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{5}/, function (req, res, next) {
	var reqUrl = req.originalUrl;
	var longUrl = "";
	var shortUrl = reqUrl.substring(1);
	db.collection('urls', function(err1, collection) {
		if (err1) { 
			console.log("Error opening URL collection.");
		}
		else {
			collection.findOne( { 'tinyUrl': shortUrl }, function(err2, result) {
				if (err2) { console.log("Error finding tiny url."); }
				else if (result) {
					//tinyUrl exists in db
					longUrl = result['longUrl'];
					//reroute 
					res.send('<script>window.location.href="http://' + longUrl + '";</script>');
				} else {
					res.sendFile('public/404.html', {root: __dirname});
				}
			});
		}
	});
});

app.listen(portNum, () => {
	console.log("Listening on port " + portNum);
});

var tinyUrl = 'localhost:' + portNum + '/';

function convertUrl(longUrl, res){
	var encoded = '';
	db.collection('urls', function(err1, collection) {
		if (err1) { console.log("Error opening URL collection."); }
		else {
			collection.findOne( { "longUrl": longUrl }, function(err2, result) {
				if (err2) { console.log("Error finding long url."); }
				else if (result) {
					// longUrl already converted
					res.send(tinyUrl + result["tinyUrl"]);
				} else {
					encodeUrl(longUrl, res);
				}
			});
		}
	});
}

var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const charLen = 5;

/* Generates a random sequence of 5 alpha-numeric characers */
function encodeUrl(longUrl, res) {
	var encoded = '';
	for (var i = 0; i < charLen; i++) {
		var randomNum = Math.floor(Math.random() * charSet.length);
		encoded += charSet.substring(randomNum, randomNum+1);
	}
	var newUrls = {'longUrl': longUrl, 'tinyUrl': encoded};
	db.collection('urls', function(err1, collection) {
		collection.insert(newUrls, function(err3, saved) {
			if (err3) { console.log("Error inserting new urls."); }
			else {
				res.send(tinyUrl + encoded);
			}
		});
	});
}
