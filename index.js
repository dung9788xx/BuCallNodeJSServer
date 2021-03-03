'use strict';
const LEFT_ROOM = "LEFT_ROM";
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
const port = process.env.PORT || 3000;

var fileServer = new (nodeStatic.Server)();
var app = http.createServer(function (req, res) {
    fileServer.serve(req, res);
}).listen(port);

const express = require('express');
const appApi = express();
const router = express.Router();
 var passwordSecurity=require("./password");

appApi.listen(3001, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
router.get('/', (req, res) => {
    res.send('Hello World!')
})
router.use('/users', function (request,res, next) {
        next();
});
var UserDAO = require('./Services/UserService');
var Validate = require('./Validate/RequestValidate');
console.log(Validate.validate({username:'aa',password:1},[{username:Validate.NUMBER}])
)
router.post('/users/login', function (req, res, next) {
    console.log(Validate.validate(req.body,{username: Validate.STRING, password: Validate.STRING}));
    UserDAO.login(req.body.username,req.body.password,function (result) {
        if(result){
            res.send("get user:"+JSON.stringify(result));
        }else{
            res.send("fail");

        }
    });

});
appApi.use(express.json())
appApi.use(express.urlencoded({
    extended: true
}))
appApi.use( router);



























var clientList = {};
var callingQueue = {};
var totalRoom = 0;
var io = socketIO.listen(app);
io.sockets.on('connection', function (socket) {
    // convenience function to log server messages on the client
    clientList[socket.id] = {status: ""};
   console.log("Client : " + JSON.stringify(clientList));
    socket.on('joinCallQueue', function () {
        callingQueue[socket.id] = {gender: ""};
console.log("CallQueue : " + JSON.stringify(callingQueue));

        findPater();
//console.log("Rooms:"+JSON.stringify(io.sockets.adapter.rooms));
    });
    socket.on('leftCallQueue', function () {
        delete callingQueue[socket.id];
//console.log("sombody left CCall queue : " + JSON.stringify(callingQueue));
    });
    socket.on('leftRoom', function (roomId) {

        socket.to(roomId).emit('buddyLeft');
        leaveAllUserInRoom(socket.id, LEFT_ROOM);
        callingQueue[socket.id] = {gender: ""};
//	console.log("Rooms:"+JSON.stringify(io.sockets.adapter.rooms));
//		findPater();
//	console.log("After budy : " + JSON.stringify(callingQueue));
    });
    socket.on('message', function (message) {
        socket.to(message.roomId).emit('message', message);
    });

    function findPater() {
        var callingId = getCallingClient();
        var joiningId = getJoiningClient();
        if (typeof callingId === "undefined" || typeof joiningId === "undefined") {
            socket.emit("noPartnerFound");
            return;
        }
        var callingSocket = io.sockets.connected[callingId];
        var joiningSocket = io.sockets.connected[joiningId];
        var roomId = ++totalRoom;
        callingSocket.join("room" + roomId);
        joiningSocket.join("room" + roomId);
        callingSocket.emit("joined", "room" + roomId,function(t){
                console.log("called join");
});
        joiningSocket.emit('joined', "room" + roomId,function(t){
                console.log("called join");
});
        callingSocket.emit("letStartCall","room"+roomId,1);
       joiningSocket.emit("letStartCall","room"+roomId,0);

        delete callingQueue[callingId];
        delete callingQueue[joiningId];
        console.log("Rooms after merge:"+JSON.stringify(io.sockets.adapter.rooms));

        console.log("done merge client");
    }

    socket.on('ipaddr', function () {
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].forEach(function (details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });
    socket.on("disconnect", function () {
        delete clientList[socket.id];
        delete callingQueue[socket.id];
        leaveAllUserInRoom(socket.id, "");
console.log("Client after disconnect: " + JSON.stringify(clientList));
    })
socket.on("error", function(){
console.log("errrrrrrorrr");
});
    function getRoomsByUser(id) {
        let usersRooms = [];
        let rooms = io.sockets.adapter.rooms;

        for (let room in rooms) {
            if (rooms.hasOwnProperty(room)) {
                let sockets = rooms[room].sockets;
                if (id in sockets && id !== room)
                    usersRooms.push(room);
            }
        }
        return usersRooms;
    }

    function leaveAllUserInRoom(id, reason) {
        let rooms = io.sockets.adapter.rooms;
console.log("Rooms:"+JSON.stringify(rooms));
        for (let room in rooms) {
            if (rooms.hasOwnProperty(room)) {
                let sockets = rooms[room].sockets;
                if (id in sockets) {
                    for (let s in sockets) {
                        io.sockets.connected[s].emit("buddyLeft")
                        io.sockets.connected[s].leave(room);
                        if (reason === LEFT_ROOM) {
                            callingQueue[s] = {status: ""};
                        }
                    }
                }
            }
        }
        totalRoom--;
    }
    function getJoiningClient() {
        if (Object.keys(callingQueue).length >= 2) {
            return Object.keys(callingQueue)[Object.keys(callingQueue).length - 1];
        }
    }
    function getCallingClient() {
        if (Object.keys(callingQueue).length >= 2) {
            return Object.keys(callingQueue)[0];
        }
    }
});
