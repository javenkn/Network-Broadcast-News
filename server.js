var net = require('net');

var CONFIG = require('./config');

var connectedSockets = [];

var server = net.createServer(function (socket) { //readable socket
  //connection listener
  console.log('Somebody connected!');
  connectedSockets.push(socket);
  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    console.log(data);
    connectedSockets.forEach(function (element) {
      element.write(data);
    });
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