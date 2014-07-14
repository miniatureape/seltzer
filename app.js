
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
                activeUser.socket.emit('editor:get-contents');
            } else {
                Users.activeUser = user;
                user.data.isActive = true;
            }

            user.socket.emit('user:created', user.data);
        }
    });

    socket.on('editor:active-contents', function(content) {

        var users = Users.needsContent();

        for (var i = 0; i < users.length; i++) {
            users[i].socket.emit('editor:active-contents', content);
        }

        Users.needingContent = [];

    });

    socket.on('editor:changed', function(args) {
        socket.broadcast.emit('editor:changed', args);
    });

});
