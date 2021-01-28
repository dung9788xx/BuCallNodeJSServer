'use strict';
const LEFT_ROOM = "LEFT_ROM";
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
const port = process.env.PORT || 80;

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(port);
var clientList = {};
var callingQueue = {};
var totalRoom = 0;
var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {
  // convenience function to log server messages on the client
  clientList[socket.id] ={status:""};
  console.log("Client : "+JSON.stringify(clientList));
  socket.on('joinCallQueue', function () {
    callingQueue[socket.id] = {gender:""};
    console.log("joing call queue");
      findPater();
  });
  socket.on('leftCallQueue', function () {
      delete callingQueue[socket.id];
  });
  socket.on('leftRoom', function (roomId) {
	console.log("buudy left"+roomId);
socket.to(roomId).broadcast.emit('buddyLeft');
leaveAllUserInRoom(socket.id, LEFT_ROOM);

  });
  socket.on('message', function(message) {
    socket.to(message.roomId).broadcast.emit('message', message);
  });
  function findPater(){
    var callingId =  getCallingClient();
    var joiningId = getJoiningClient();
    if(typeof callingId === "undefined" || typeof  joiningId === "undefined") {
        socket.emit("noPartnerFound");
      console.log(callingId+"not found patter"+joiningId);
        return;
    }
    console.log(callingId+"___found__"+joiningId);
    var callingSocket = io.sockets.connected[callingId];
    var joiningSocket = io.sockets.connected[joiningId];
    var roomId = ++totalRoom;
    callingSocket.join("room"+roomId);
    joiningSocket.join("room"+roomId);
    callingSocket.emit("joined", "room"+roomId);
    joiningSocket.emit('joined', "room"+roomId);
    callingSocket.emit("letStartCall");
    console.log("started");
    console.log(JSON.stringify("ROOOM"+getRoomsByUser(socket.id)));

  }
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
  socket.on("disconnect", function () {
      delete  clientList[socket.id];
      delete callingQueue[socket.id];
      leaveAllUserInRoom(socket.id,"" );
      console.log("Client : "+JSON.stringify(clientList));
  })

  function getRoomsByUser(id){
    let usersRooms = [];
    let rooms = io.sockets.adapter.rooms;

    for(let room in rooms){
      if(rooms.hasOwnProperty(room)){
        let sockets = rooms[room].sockets;
        if(id in sockets && id != room)
          usersRooms.push(room);
      }
    }

    return usersRooms;
  }
  function leaveAllUserInRoom(id, reason) {
    let rooms = io.sockets.adapter.rooms;

    for(let room in rooms){
      if(rooms.hasOwnProperty(room)){
        let sockets = rooms[room].sockets;
        if(id in sockets && id != room){
          for (let s in sockets){
            io.sockets.connected[s].leave(room);
            if(reason == LEFT_ROOM) {
              callingQueue[s] = {status:""};
            }
          }
        }
      }
    }
    totalRoom--;
  }
  function getJoiningClient() {
    if(Object.keys(callingQueue).length >=2) {
      return Object.keys(callingQueue)[Object.keys(callingQueue).length - 1];
    }
  }
  function getCallingClient() {
    if(Object.keys(callingQueue).length >=2) {
      return Object.keys(callingQueue)[0];
    }
  }
});
