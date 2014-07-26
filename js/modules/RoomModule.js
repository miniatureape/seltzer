var RoomLayout = require('../views/RoomLayout');
var Users      = require('../models/Users');

var RoomModule = function(socket) {
    this.socket = socket;
};

RoomModule.prototype = {

    start: function(room) {

        this.room = room;
        this.user = null;

        this.users = new Users();

        this.layout = new RoomLayout({
            socket: this.socket,
            users: this.users
        });

        _.bindAll.apply(_, [this].concat(_.functions(this)));

        this.setupSocket();
    },

    setupSocket: function() {
        this.socket.on('connect', this.handleOnConnect);
        this.socket.on('room:404', this.room404);
        this.socket.on('user:created', this.userCreated);
        this.socket.on('user:set', this.handleSetUsers);
    },

    handleOnConnect: function(room) {
        this.requestNewUser(room);
        this.getUserList(room);
    },

    requestNewUser: function(room) {
        var desiredName = prompt('Name?');

        this.socket.emit('user:new', {
            room: room,
            desiredName: desiredName
        });

    },

    getUserList: function() {
        this.socket.emit('user:list');
    },

    userCreated: function(newUser) {
        this.user = new User(newUser);
        this.users.add(this.user);
        if (!this.user.get('active')) {
            this.socket.emit('editor:get-contents');
        }
    },

    room404: function(room) {
        console.error('Room does not exist', room);
    },

    userNameTaken: function() {
        console.error('User name is already taken');
        this.requestNewUser();
    },

    getLayout: function() {
        return this.layout;
    }, 

    handleSetUsers: function(users) {
        console.log('got users', users);
        this.users.reset(users);
    }
};

module.exports = RoomModule;
