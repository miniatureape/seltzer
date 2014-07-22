
var express = require('express'),
    app = express(), 
    server = require('http').createServer(app), 
    io = require('socket.io').listen(server);

server.listen(8000);
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/create', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/room/:room', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var Rooms = {

    exists: function() {
        return true;
    }

}

var Users = {

    activeUser: null,
    usersNeedingContent: [],

    nameExists: function() {
        return false;
    },

    create: function(name, socket) {
        var user = {
            socket: socket,
            data: {
                name: name,
                isActive: false
            }
        };
        this.usersNeedingContent.push(user);
        return user;
    },

    getActive: function() {
        return this.activeUser;
    },

    needsContent: function() {
        return this.usersNeedingContent;
    }
}

function relay(name, socket) {
    socket.on(name, function(args) {
        socket.broadcast.emit(name, args);
    });
}

io.sockets.on('connection', function (socket) {

    socket.on('user:new', function(data) {

        if (!Rooms.exists(data.room)) {
            console.log('room does not exist');
        }

        if (Users.nameExists(data.desiredName)) {
            socket.emit('user:name-exists', data.desiredName);
        } else {
            var user = Users.create(data.desiredName, socket);
            var activeUser = Users.getActive();

            if (activeUser) {
                console.log('requesting: providing contents');
                activeUser.socket.emit('editor:provide-contents');
            } else {
                Users.activeUser = user;
                user.data.isActive = true;
            }

            user.socket.emit('user:created', user.data);
        }
    });

    socket.on('editor:provide-contents', function(contents) {
        console.log('active user providing contents');

        var users = Users.needsContent();

        for (var i = 0; i < users.length; i++) {
            console.log('setting contents');
            users[i].socket.emit('editor:set-contents', contents);
        }

        Users.needingContent = [];

    });

    relay('editor:changed', socket);
    relay('editor:active', socket);

});
