var net = require('net');

var CONFIG = require('./config');

var connectedSockets = [];
var socketUsernames = [];

var server = net.createServer(function (socket) { //readable socket
  //connection listener
  console.log('Somebody connected!');
  connectedSockets.push(socket);
  socket.setEncoding('utf8');
  //create an object for the seconds rate limiter
  var objOfTimes = {};

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
      var date = new Date();
      var timeMs = Date.now();
      //shows up only to the seconds place
      var simplifiedTime = timeMs.toString().slice(0, -3);

      connectedSockets.forEach(function (element) {
        // transfer the information that is being passed around
        element.write('User "' + socket.username + '"' + ' from ' +
          socket.remoteAddress.slice(7) + ':' + socket.remotePort + ': ' + data);
        element.write(date.toString());
      });
      // print it out on the server
      console.log('User "' + socket.username + '"' + ' from ' +
          socket.remoteAddress.slice(7) + ':' + socket.remotePort + ': ' + data);
      console.log(date.toString());

      // checks if the object has a key which is "simplifiedTime"
        // if it does then it checks if it is greater than or equal to 3
            // if it is greater than 3 it kicks the client
        // else continues on
      // if the object doesn't have the specified key
      // it creates one and sets that value to 1
      if(objOfTimes[simplifiedTime]){
        objOfTimes[simplifiedTime]++;
        if(objOfTimes[simplifiedTime] >= 3){
          socket.write('Too many posts per second! Must be 3 messages/second.');
          connectedSockets.forEach(function (element, index, array) {
            if(connectedSockets[index].username === socket.username){
              if(socketUsernames.indexOf(connectedSockets[index].username) !== -1){
                socketUsernames.splice(index, 1);
              }
              connectedSockets.splice(index, 1);
            }else{
              console.log('There is no user with that username.');
            }
          });
          socket.end();
          console.log('User "' + socket.username + '" has been kicked.');
        }
      }else{
        objOfTimes[simplifiedTime] = 1;
      }
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected.');
  });
});


server.listen(CONFIG.PORT, () => {
  var PORT = server.address().port;
  console.log('Listening on port', PORT);

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

        if(socketUsernames.indexOf(kickUser) === -1){ // Non-existing username
          console.log(kickUser + ' cannot be found.');
        }else {

          // filter the connectedSockets array to only the ones that equal the kickUser
          // then for each element in that filtered array splice the specific element from the
          // connectedSocket array, socketUsernames, and IP/Port array
          connectedSockets
            .filter(function (element, index) {
              return element.username === kickUser;
            })
            .forEach(function (element, index, array) {
              var indexDelete = socketUsernames.indexOf(element.username);
              if(indexDelete !== -1){
                socketUsernames.splice(indexDelete, 1);
                connectedSockets.splice(indexDelete, 1);
                console.log(element.username + ' has been kicked.');
                element.end();
              }
            });
        }


      }else if(data.toString().slice(0,4) === 'kick'){
        //if the admin wants to kick user by IP/Port #
        //kick the ip user
        //gets the data and obtains the second word of it which is the
        //username
        var kickIPPort = data.toString().split(' ')[1].trim();
        var IPPortArr = []; //created array for only IP/Ports

        // pushes the IP/Ports of each socket in the connectedSockets array
        connectedSockets.forEach(function (element) {
              IPPortArr.push(element.remoteAddress.slice(7) + ':' +
                element.remotePort);
        });
        // if the ip port cannot be found
        if(IPPortArr.indexOf(kickIPPort) === -1) {
          console.log(kickIPPort + ' cannot be found.');
        }else { //else

          // filter the connectedSockets array to only the ones that equal the kickIPPort
          // then for each element in that filtered array splice the specific element from the
          // connectedSocket array, socketUsernames, and IP/Port array
          connectedSockets
            .filter(function (element, index) {
              return element.remoteAddress.slice(7) + ':' +
              element.remotePort === kickIPPort;
            })
            .forEach(function (element, index, array) {
              var indexDelete = socketUsernames.indexOf(element.username);
              if(indexDelete !== -1){ // if it exists
                IPPortArr.splice(indexDelete,1);
                socketUsernames.splice(indexDelete, 1);
                connectedSockets.splice(indexDelete, 1);
                console.log(element.username + ' has been kicked.');
                element.end();
              }else { // it doesn't exist
                console.log('IP/Port does not exist.');
              }
            });
        }
      }else{ // if the admin doesn't want to ban/kick someone
      //sends the admin broadcast to the socket and clients
        connectedSockets.forEach(function (element, index, array) {
          element.write('[ADMIN]: ' + data.toString().trim());
        });
      }
  });
});

server.on('error', function (error) {
  console.error(error);
});