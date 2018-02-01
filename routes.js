// routes.js

module.exports = function(app, db) {
	app.get(/\/[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]{5}/, function (req, res) {
		var reqUrl = req.url;
		var longUrl = "";
		reqUrl = reqUrl.substring(1);
		console.log(reqUrl);
		db.collection('urls', function(err1, collection) {
			if (err1) { console.log("Error opening URL collection.") }
			else {
				collection.find( {'tinyUrl': reqUrl}, function(err2, result) {
					if (err2) { console.log("Error finding tiny url.") }
					else if (result) {
						//tinyUrl exists in db
						longUrl = result['longUrl'];
						//reroute 
						return res.redirect(longUrl);
					} else {
						res.sendFile('public/404.html', {root: __dirname});
					}
				});
			}
		});
	});
};