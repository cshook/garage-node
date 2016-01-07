var express = require('express'),
	path = require('path'),
	config = require('./config'),
	async = require('async'),
	gpio = require('pi-gpio'),
	app = express();

app.set('port', process.env.PORT || 3001);

app.use('/', express.static(__dirname + '/public'));

function delayPinWrite(pin, value, callback) {
	setTimeout(function() {
		gpio.write(pin, value, callback);
	}, config.RELAY_TIMEOUT);
}

app.get("/api/ping", function(req, res) {
	res.json("pong");
});

app.post("/api/garage/control", function(req, res) {
	console.log('Control Garage Door');
	async.series([
		function(callback) {
			// Open pin for output
			gpio.open(config.RELAY_PIN, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			gpio.write(config.RELAY_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.RELAY_PIN, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				gpio.close(config.RELAY_PIN);
				// Return json
				res.json("ok");
			}, config.RELAY_TIMEOUT);
		}
	]);
});

console.log(app.get('port'));
app.listen(app.get('port'));