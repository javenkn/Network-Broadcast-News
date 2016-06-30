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
}); //writable socket

socket.on('connect', () => {
    rl.question('Enter username: ' + '\n', (username) => {
      socket.write(username);
    });
});

socket.on('data', (data) => {
  console.log(data);
  if(data === 'You cannot have "admin" in your username.' || data === 'Choose another username.'){
    rl.question('Enter username: ' + '\n', (username) => {
      socket.write(username);
    });
  } else if(data.slice(0,7).toLowerCase() === 'welcome'){
    console.log('Start chatting!');
    process.stdin.on('data', (data) => {
      socket.write(socket.localAddress + socket.localPort + ': ' + data);
    });
  }
});

socket.on('close', () => {
  console.log('Disconnected from the server');
});