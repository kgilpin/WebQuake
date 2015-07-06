var httpProxy = require('http-proxy'),
	expandHomeDir = require('expand-home-dir'),
	yaml = require('js-yaml'),
	path = require('path'),
	format = require('util').format,
	url = require('url'),
	netrc = require('netrc'),
	_ = require('underscore'),
	fs = require('fs'),
	conjur = require('conjur-api'),
	https = require('https'),
	http = require('http')
	;

function firstExistingFile(files) {
	return _.compact(_.select(files, function(fileName) {
		return fileName && fs.existsSync(fileName);
	}))[0];
}

var configFileName = firstExistingFile([ process.env['CONJURRC'], expandHomeDir('~/.conjurrc'), '/etc/conjur.conf' ]);

if ( !configFileName ) {
	console.log("Can't find CONJURRC config file");
	process.exit(1);
}

console.log("Loading Conjur config from", configFileName);

var config = yaml.safeLoad(fs.readFileSync(configFileName, 'utf8'));
var certificateFileName = config['cert_file'];
var certificate;
if ( certificateFileName ) {
  certificate = fs.readFileSync(path.resolve(configFileName, certificateFileName), 'utf8');
}
var authnURL = process.env['CONJUR_AUTHN_URL'] || format("%s/authn", config['appliance_url']);

var identity = {};
if ( ( identity.username = process.env['CONJUR_AUTHN_LOGIN'] ) && ( identity.password = process.env['CONJUR_AUTHN_API_KEY'] ) ) {
	// pass
}
else {
	var identityFile = firstExistingFile([ config['netrc_path'], expandHomeDir('~/.netrc'), '/etc/conjur.identity' ]);
	var machine = netrc(identityFile)[authnURL];
	if ( !machine ) {
		console.log("Machine " + authnURL + " not found in " + identityFile)
		process.exit(1);
	}
	identity.username = machine.login;
	identity.password = machine.password;
}

authnURL = url.parse(authnURL);

var TOKEN = null;

var proxy = new httpProxy.createProxyServer({
	target: {
		host: 'localhost',
		port: 9015
	}
});

var proxyServer = http.createServer(function (req, res) {
	var token = new Buffer(JSON.stringify(TOKEN), 'utf8');
	req.headers.authorization = format('Token token="%s"', token.toString('base64'));
	proxy.proxyRequest(req, res);
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
proxyServer.on('upgrade', function (req, socket, head) {
	console.log('Upgrading to WebSockets');
	proxy.proxyWebsocketRequest(req, socket, head);
});

proxyServer.running = false;

function authenticate() {
	// Fetch a new token every 5 minutes
	var timer = setTimeout(authenticate, 1000 * 60 * 5);
	
	var options = {
		hostname: authnURL.hostname,
		method: 'POST',
		path: format("%s/users/%s/authenticate", authnURL.path, identity.username)
	};
	if ( certificate ) {
	  options.ca = certificate;
	}
	
	if ( !proxyServer.running )
		console.log('Authenticating', identity.username);
	
	var req = https.request(options, function(res) {
	  var token = '';
	  res.setEncoding('utf8');
	  res.on('data', function(data) {
	  	token += data;
	  });	
	  res.on('error', function(e) {
	  	console.log(e);
	  	// Retry sooner
	  	clearTimeout(timer);
	  	setTimeout(authenticate, 1000 * 60);
	  });	
	  res.on('end', function() {
			if ( res.statusCode === 200 ) {
		  	TOKEN = JSON.parse(token);
				if ( !proxyServer.running ) {
					console.log('Authenticated', TOKEN['data']);
					proxyServer.running = true;
					proxyServer.listen(8015);
					console.log('Listening on 8015');
				}
			}
			else {
				console.log("Authentication failed:", res.statusCode);
			}
	  });
	});
	req.write(identity.password);
	req.end();
}

authenticate();
