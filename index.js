// index.js

// Express initialization
var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
var bodyParser = require('body-parser');
var dotEnv = require('dotenv').config();
//const routes = require('./routes');
const portNum = process.env.PORT;

// Set up public path
app.use(express.static(__dirname + '/public'));

app.use(function(request, response, next) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up db connection
var MongoClient = require('mongodb').MongoClient;
var mongoUri = process.env.MONGODB_URL;
var db = MongoClient.connect(mongoUri, function(error, client) {
	if (error) {
		console.log("MongoClient connection failed.");
	} else {
		db = client.db('urlencodes');
	}
});

app.post('/api', function(req, res) {
	if (!req.body) { 
		return res.sendStatus(400); 
	}
	var encoded = convertUrl(req.body.url);
	res.send(encoded);
});

app.use(/\/[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{5}/, function (req, res, next) {
	var reqUrl = req.url;
	var longUrl = "";
	var shortUrl = reqUrl.substring(1);
	db.collection('urls', function(err1, collection) {
		if (err1) { 
			console.log("Error opening URL collection.") 
		}
		else {
			collection.findOne( {'tinyUrl': shortUrl}, function(err2, result) {
				if (err2) { console.log("Error finding tiny url.") }
				else if (result) {
					//tinyUrl exists in db
					longUrl = result['longUrl'];
					//reroute 
					return res.status(301).redirect("https://" + longUrl);
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


function convertUrl(longUrl){
	var tinyUrl = 'localhost:' + portNum + '/';
	var encoded = '';
	db.collection('urls', function(err1, collection) {
		if (err1) { console.log("Error opening URL collection.") }
		else if (collection == undefined) {
			console.log("collection doesn't exist.");
			return tinyUrl;
		} else {
			collection.findOne( { "longUrl": longUrl }, function(err2, result) {
				if (err2) { console.log("Error finding long url.") }

				else if (result) {
					// longUrl already converted
					return tinyUrl + result["tinyUrl"];
				} else {
					encoded = encodeUrl(longUrl);
					console.log(encoded);
					newUrls = {'longUrl': longUrl, 'tinyUrl': encoded};
					collection.insert(newUrls, function(err3, saved) {
						if (err3) { console.log("Error inserting new urls.") }
						else {
							return tinyUrl + encoded;
						}
					});
				}
			});
		}
	});
}

var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const charLen = 5;

/* Generates a random sequence of 5 alpha-numeric characers */
function encodeUrl(longUrl) {
	var encoded = '';
	for (var i = 0; i < charLen; i++) {
		var randomNum = Math.floor(Math.random() * charSet.length);
		encoded += charSet.substring(randomNum, randomNum+1);
	}
	return encoded;
}
