// index.js

// Express initialization
var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var dotEnv = require('dotenv').config();
const routes = require('./routes');
const portNum = process.env.PORT;

// Set up db connection
var MongoURL = process.env.MONGODB_URL || process.env.MONGOLAB_URL;
var MongoClient = require('mongodb').MongoClient, format = require("util").format;

var db = MongoClient.connect(MongoURL, function(error, dbConnection) {
	db = dbConnection;
});

// Set up public path
app.use(express.static(__dirname + '/public'));

app.use(function(request, response, next) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));


app.listen(portNum, () => {
	console.log("Listening on port " + portNum);
});


function convertUrl(longUrl){
	var tinyUrl = 'localhost:' + portNum + '/';
	var encoded = '';
	db.collection('urls', function(err1, collection) {
		if (err1) { console.log("Error opening URL collection.") }

		else {
			collection.find( {"longUrl": longUrl}, function(err2, result) {
				if (err2) { console.log("Error finding long url.") }

				else if (result) {
					// longUrl already converted
					return tinyUrl + result["tinyUrl"];
				} else {
					encoded = encodeUrl(longUrl);
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
