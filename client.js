var net = require('net');

var CONFIG = require('./config');
var socket = new net.Socket();

socket.setEncoding('utf8');

socket.connect({ port: CONFIG.PORT}, () => {
  console.log('Connected to server!');

}); //writable socket

process.stdin.on('data', (data) => {
  socket.write('SERVER JCAST FROM ' + socket.localAddress + socket.localPort + ': ' + data);
});

socket.on('data', (data) => {
  console.log(data);
});

socket.on('close', () => {
  console.log('Disconnected from the server');
});