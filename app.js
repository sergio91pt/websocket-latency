/**
 * Init all modules and servers
 */
var express = require('express'),
    http = require('http'),
	path = require('path'),
    WebSocket = require('ws');

/**
 * Init Web Application
 */
var env = process.env.NODE_ENV || 'development';
var serverPort = process.env.PORT || 8080;
var app = express();


app.set('port', serverPort);
app.use(express.static(path.join(__dirname, 'app')));

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log((new Date()) + " Server is listening on port " + serverPort);
});

const wss = new WebSocket.Server({
    server,
    perMessageDeflate: false
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    const idx = data.readUInt8(0);
    ws.send(idx.toString());
  });
});
