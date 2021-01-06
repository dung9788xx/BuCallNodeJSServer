'use strict';
const MALE=1;
const FEMALE=2;
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
const port = process.env.PORT || 3000;
var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(port);

var io = socketIO.listen(app);
var findingUsers = {};
var roomOfUser = {};
var totalRoom = 0;
io.sockets.on('connection', function(socket) {
  socket.on('findingUsers', function (user) {
    findingUsers[socket.id] = user;
    console.log("Current finding user"+JSON.stringify(findingUsers));
  });
  console.log('Have connectto server');
  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function(message) {
    log('Client said: ', message);

    // for a real app, would be room-only (not broadcast)
    var room= Object.keys(io.sockets.adapter.sids[socket.id]).filter(item => item!=socket.id)[0];
    socket.to(room).emit('message', message);
  });

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);
    // var clientsInRoom = io.sockets.adapter.rooms[room];
    // var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    // log('Room ' + room + ' now has ' + numClients + ' client(s)');
    if (totalRoom === 0) {
      socket.join(totalRoom+1);
      socket.emit('created', totalRoom+1, socket.id);
      totalRoom++;
      roomOfUser[socket.id] = totalRoom;
      console.log("created room");
    }else{
      io.sockets.in(totalRoom).emit('join', totalRoom);
      socket.join(totalRoom);
      socket.emit('joined', totalRoom, socket.id);
      io.sockets.in(totalRoom).emit('ready');
      console.log("joined room");
      roomOfUser[socket.id] = totalRoom;
    }
    Object.keys(findingUsers).forEach(function (user) {
      console.log("AAAA"+findingUsers[user].iam);
    })
    console.log('Totalaaa  room :'+JSON.stringify(io.sockets.adapter.rooms));
    //
    // if (numClients === 0) {
    //   console.log("creating room");
    //   socket.join("room1");
    //   log('Client ID ' + socket.id + ' created room ' + room);
    //   socket.emit('created', room, socket.id);
    //
    // } else if (numClients === 1) {
    //   log('Client ID ' + socket.id + ' joined room ' + room);
    //   io.sockets.in(room).emit('join', room);
    //   socket.join(room);
    //   socket.emit('joined', room, socket.id);
    //   io.sockets.in(room).emit('ready');
    //   console.log("joinning room");
    //
    // } else { // max two clients
    //   socket.emit('full', room);
    // }
  });

  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function(){
    console.log('received bye');
  });
  socket.on('disconnect',function () {
    delete findingUsers[socket.id];
    var room=  roomOfUser[socket.id];
    console.log("Room of user disconnected"+room);
    // io.sockets.clients(room).forEach(function(s){
    //   s.leave(room);
    // });
    var clients = io.sockets.adapter.rooms[room].sockets;

    for (var clientId in clients ) {

      //this is the socket of each client in the room.
      var clientSocket = io.sockets.connected[clientId];

      //you can do whatever you need with this
      clientSocket.leave(room)

    }
    console.log('Totalaaa after disconnec  room :'+JSON.stringify(io.sockets.adapter.rooms));
  });
  console.log('Total  room :'+JSON.stringify(io.sockets.adapter.rooms));
});
