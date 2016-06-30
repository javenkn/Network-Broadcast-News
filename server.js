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
    if(socket.username === undefined){ //if there is no username
      if(data.toLowerCase() === 'admin' || data.toUpperCase() === '[ADMIN]') {
        //username cannot have the word admin
        socket.write('You cannot have "admin" in your username.');
      } else if(socketUsernames.indexOf(data) === -1) {
      //if username isn't found in the username array
        socketUsernames.push(data);
        socket.username = data;
        socket.write('Welcome ' + socket.username);
      } else { //else the name exists so make the client choose another name
        socket.write('Choose another username.');
        console.log('MATCHING');
      }
    }else{ //if the socket has an username
      connectedSockets.forEach(function (element) {
        // transfer the information that is being passed around
        element.write('User "' + socket.username + '"' + ' from ' +
          socket.remoteAddress.slice(7) + ':' + socket.remotePort + ': ' + data);
      });
      // print it out on the server
      console.log('User "' + socket.username + '"' + ' from ' +
          socket.remoteAddress.slice(7) + ':' + socket.remotePort + ': ' + data);
    }
  });

  //this is for the server input if the admin wants to write/ban something/someone
  process.stdin.on('data', (data) => {
    //if the admin wants to kick user by username
      if(data.toString().slice(0,5) === '\\kick'){
        //kick user
        //gets the data and obtains the second word of it which is the
        //username
        var kickUser = data.toString().split(' ')[1].trim();
        //goes through the connected sockets array and socket username array
        //and splices the one that is getting kicked
        connectedSockets.forEach(function (element, index, array) {
          if(connectedSockets[index].username === kickUser){
            if(socketUsernames.indexOf(connectedSockets[index].username) !== -1){
              socketUsernames.splice(index, 1);
            }
            connectedSockets.splice(index, 1);
            //ends the socket so that the client disconnects
            element.emit('end');
          }
        });
      }else if(data.toString().slice(0,4) === 'kick'){
        //if the admin wants to kick user by IP/Port #
        //kick the ip user
        //gets the data and obtains the second word of it which is the
        //username
        var kickIPPort = data.toString().split(' ')[1].trim();
        //goes through the connected sockets array and socket username array
        //and splices the one that is getting kicked
        connectedSockets.forEach(function (element, index, array) {
          if(connectedSockets[index].remoteAddress.slice(7) + ':' +
          connectedSockets[index].remotePort === kickIPPort){
            if(socketUsernames.indexOf(connectedSockets[index].username) !== -1){
              socketUsernames.splice(index, 1);
            }
            connectedSockets.splice(index, 1);
            //ends the socket so that the client disconnects
            element.emit('end');
          }
        });
      }else{ // if the admin doesn't want to ban/kick someone
      //sends the admin broadcast to the socket and clients
        socket.write('[ADMIN]: ' + data);
      }
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