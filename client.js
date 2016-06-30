var readline = require('readline');
var net = require('net');

var CONFIG = require('./config');
var socket = new net.Socket();

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

socket.setEncoding('utf8');

socket.connect({ port: CONFIG.PORT}, () => {
  console.log('Connected to server!');
  rl.question('Enter username: ', function (username) {
    console.log('Welcome ' + username);
    process.stdin.on('data', (data) => {
      socket.write('User ' + username + ' from ' + socket.localAddress + socket.localPort + ': ' + data);
    });
  });
}); //writable socket



socket.on('data', (data) => {
  console.log(data);
});

socket.on('close', () => {
  console.log('Disconnected from the server');
});