var express = require('express'),
	exec = require('child_process').exec,
	argv = require('optimist')
	.usage('Usage: $0 -p [port]')
	.default('p', 8080)
	.argv;

var app = express();
app.use(express.static('public'));

var server = app.listen(argv.p, function () {
  var port = server.address().port;
  console.log('To play Quake, go to http://localhost:%s', port);
});
