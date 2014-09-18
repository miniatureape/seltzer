var express = require('express'),
    app      = express(),
    server   = require('http').createServer(app),
    io       = require('socket.io').listen(server),
    _        = require('underscore'),
    Backbone = require('./js/lib/backbone'),
    User     = require('./js/models/User'),
    Users    = require('./js/models/Users');

server.listen(8000);
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));

var Rooms = {
    exists: function() {
        return true;
    }
}

var users = new Users();
var sockets = {};

function getSocket(user) {
    return sockets[user.get('id')];
}

// Listen to socket event name on socket, broadcasting its
// message to all other users when heard.
function relay(name, socket) {
    socket.on(name, function(args) {
        socket.broadcast.emit(name, args);
    });
}

// message to all other users when heard from active user.
function relayIfActiveUser(name, socket) {
    socket.on(name, function(args) {
        user = users.get(socket.id);

        if (user && user.get('active')) {
            socket.broadcast.emit(name, args);
        }

    });
}

// Endpoints

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/create', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/room/:room', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {

    sockets[socket.id] = socket;

    relayIfActiveUser('editor:changed', socket);
    relayIfActiveUser('editor:cursor-change', socket);
    relayIfActiveUser('editor:selection-change', socket);

    relayIfActiveUser('editor:active', socket);

    socket.on('user:new', function(data) {

        if (!Rooms.exists(data.room)) {
            console.log('room does not exist');
        }

        if (users.nameExists(data.desiredName)) {

            socket.emit('user:name-exists', data.desiredName);

        } else {

            var user = new User({
                id: socket.id,
                name: data.desiredName,
            }); 
            users.add(user);

            var activeUser = users.findWhere({active: true});

            if (activeUser) {
                getSocket(activeUser).emit('editor:provide-contents');
            } else {
                users.setActive(user);
            }

            getSocket(user).emit('user:created', user.toJSON());
            socket.broadcast.emit('user:set', users.toJSON())
        }
    });

    socket.on('editor:provide-contents', function(contents) {
        var usersNeedingContent = users.needingContent();

        _.each(usersNeedingContent, function(user) {
            getSocket(user).emit('editor:set-contents', contents);
            user.set('needs_content', false);
        });
    });

    socket.on('user:list', function() {
        socket.emit('user:set', users.toJSON())
    });

    socket.on('disconnect', function() {
        var user = users.get(socket.id);
        users.remove(user);
        delete sockets[socket.id];
    });

    socket.on('fetch-contents', function(repo) {
        console.log("fetching contents", repo);
    });

});
