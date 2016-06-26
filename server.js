var net = require('net');

var CONFIG = require('./config');

var server = net.createServer(function (socket) { //readable socket
  //connection listener
  console.log('Somebody connected!');
  socket.write('Hello\n');

  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    console.log(data);
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