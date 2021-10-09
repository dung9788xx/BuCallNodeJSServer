'use strict';
require('dotenv').config();
const LEFT_ROOM = "LEFT_ROM";
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require('socket.io');
const port = process.env.PORT || 3000;
const api_port = 3001;
var fileServer = new (nodeStatic.Server)();
var app = http.createServer(function (req, res) {
    fileServer.serve(req, res);
}).listen(port);

const express = require('express');
const appApi = express();
const router = express.Router();
var passwordSecurity = require("./password");

appApi.listen(api_port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
router.get('/', (req, res) => {
    res.send('Hello World!')
})
router.use('/users', function (request, res, next) {
    next();
});
var UserDAO = require('./Services/UserService');
var passwordSecurity = require("./password");
global.Validate = require('./Validate/RequestValidate');
global.Response = require('./Services/Response');
global.ApiAuthMiddleware = require('./Middleware/ApiAuthMiddleware')
let UserRouter = require('./Routers/UserRouter')





appApi.use(express.json())
appApi.use(express.urlencoded({
    extended: true
}))
appApi.use(UserRouter);



























var clientList = {};
var callingQueue = {};
var totalRoom = 0;
var io = socketIO.listen(app)
var clientMessaging = {};
io.sockets.on('connection', function (socket) {

    socket.on('joinMessaging', function (userId, callback) {
        clientMessaging[userId] = socket.id
        callback(true);
    });
    socket.on('newMessage', function ( data, callback) {
        console.log(clientMessaging);
        let receiveSocket = io.sockets.connected[clientMessaging[data.partnerUserId]];
        if(typeof receiveSocket != 'undefined'){
            receiveSocket.emit('hasNewMessage')
            console.log('emited')
        } else {
            console.log('errror')
            console.log(data.partnerUserId)
        }
        let message = data.message[0];
        message.sending=false;
        message.sent=true;

        UserDAO.addMessage(data.conversationId,data.message[0], function (result) {
            if(result) {
                callback(data.message[0]._id);
            }
        })

    });
//TODO
    //delete user in ClientMessaging when disconnect













    // convenience function to log server messages on the client
    clientList[socket.id] = {status: ""};
    // console.log("Client : " + JSON.stringify(clientList));
    socket.on('joinCallQueue', function (name) {
        callingQueue[socket.id] = {gender: "", name: name};
        // console.log("CallQueue : " + JSON.stringify(callingQueue));

        findPater();
//console.log("Rooms:"+JSON.stringify(io.sockets.adapter.rooms));
    });
    socket.on('leftCallQueue', function () {
        delete callingQueue[socket.id];
//console.log("sombody left CCall queue : " + JSON.stringify(callingQueue));
    });
    socket.on('leftRoom', function (roomId, isDisconnect, isNotRejoinQueue, name) {
        console.log("client call left ROm")
        if (isDisconnect) {
            socket.to(roomId).emit('buddyLeft', true);
        } else {
            socket.to(roomId).emit('buddyLeft');

        }
        if (isNotRejoinQueue) {
            leaveAllUserInRoom(socket.id, LEFT_ROOM, false);

        } else {
            leaveAllUserInRoom(socket.id, LEFT_ROOM, true, name);

        }
        if (!isNotRejoinQueue) {
            callingQueue[socket.id] = {gender: "", name: name};

        } else {
            console.log("not re join")
        }
    });
    socket.on('message', function (message) {
        if(message.type === "addFriend"){

            UserDAO.addFriend(message.user_id,message.friend_id, function (result) {
                if(result) {
                    io.in(message.roomId).emit("addFriendSuccess");
                }
            })
        }else{
            socket.to(message.roomId).emit('message', message);

        }
    });

    function findPater() {
        let callingId = getCallingClient();
        let joiningId = getJoiningClient();
        if (typeof callingId === "undefined" || typeof joiningId === "undefined") {
            socket.emit("noPartnerFound");
            return;
        }
        let callingSocket = io.sockets.connected[callingId];
        let joiningSocket = io.sockets.connected[joiningId];
        let roomId = ++totalRoom;
        callingSocket.join("room" + roomId);
        joiningSocket.join("room" + roomId);
        callingSocket.emit("joined", "room" + roomId, callingQueue[joiningId], function (t) {
            console.log("called join");
        });
        joiningSocket.emit('joined', "room" + roomId, callingQueue[callingId], function (t) {
            console.log("called join");
        });
        callingSocket.emit("letStartCall", "room" + roomId, 1);
        joiningSocket.emit("letStartCall", "room" + roomId, 0);

        delete callingQueue[callingId];
        delete callingQueue[joiningId];
        console.log("Rooms after merge:" + JSON.stringify(io.sockets.adapter.rooms));

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
    socket.on("disconnecting", function () {
        console.log("Roomdisconnected:" + getRoomsByUser(socket.id));
        socket.to(getRoomsByUser(socket.id)).emit('buddyLeft', true);
    })
    socket.on("disconnect", function () {
        delete clientList[socket.id];
        delete callingQueue[socket.id];
        leaveAllUserInRoom(socket.id, "", false);
        console.log("Client after disconnect: " + JSON.stringify(clientList));
    })
    socket.on("error", function () {
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

    function leaveAllUserInRoom(id, reason, rejoin, name) {
        let rooms = io.sockets.adapter.rooms;
        console.log("Rooms:" + JSON.stringify(rooms));
        for (let room in rooms) {
            if (rooms.hasOwnProperty(room)) {
                let sockets = rooms[room].sockets;
                if (id in sockets) {
                    for (let s in sockets) {
                        io.sockets.connected[s].leave(room);
                        if (reason === LEFT_ROOM && rejoin) {
                            callingQueue[s] = {status: "", name: name};
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
