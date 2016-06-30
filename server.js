var net = require('net');

var CONFIG = require('./config');

var connectedSockets = [];

var socketUsernames = [];

var server = net.createServer(function (socket) { //readable socket
  //connection listener
  console.log('Somebody connected!');
  connectedSockets.push(socket);
  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    if(socket.username === undefined){
      if(data.toLowerCase() === 'admin' || data.toUpperCase() === '[ADMIN]') {
        socket.write('You cannot have "admin" in your username.');
      } else if(socketUsernames.indexOf(data) === -1) {
        socketUsernames.push(data);
        socket.username = data;
        socket.write('Welcome ' + socket.username);
        console.log(socketUsernames);
      } else {
        socket.write('Choose another username.');
        console.log('MATCHING');
      }
    }else{
      connectedSockets.forEach(function (element) {
        element.write('User "' + socket.username + '"' + ': ' + data);
      });
      console.log('User "' + socket.username + '"' + ': ' + data);
    }
  });

  process.stdin.on('data', (data) => {
      socket.write('[ADMIN]: ' + data);
  });

  socket.on('end', () => {
    console.log('Client disconnected.');
  });
});

server.listen(CONFIG.PORT, () => {
  var PORT = server.address().port;
  console.log('Listening on port', PORT);
});

server.on('error', function (error) {
  console.error(error);
});