var RoomLayout = require('../views/RoomLayout');
var Users      = require('../models/Users');
var User       = require('../models/User');

var RoomModule = function(socket) {
    this.socket = socket;
    this.user = new User();
    this.users = new Users();
    this.applicationState = new Backbone.Model;

    this.layout = new RoomLayout({
        socket: this.socket,
        users: this.users,
        user: this.user,
        applicationState: this.applicationState,
    });
};

RoomModule.prototype = {

    start: function(room) {
        this.room = room;
        _.bindAll.apply(_, [this].concat(_.functions(this)));
        this.setupSocket();
    },

    setupSocket: function() {
        this.socket.on('connect', this.handleOnConnect);
        this.socket.on('room:404', this.room404);
        this.socket.on('user:created', this.userCreated);
        this.socket.on('user:set', this.handleSetUsers);
        this.socket.on('disconnect', this.handleOnDisconnect);
    },

    handleOnConnect: function(room) {
        this.applicationState.set('connected', true);
        this.requestNewUser(room);
        this.getUserList(room);
    },

    handleOnDisconnect: function(room) {
        this.applicationState.set('connected', false);
    },

    requestNewUser: function(room) {
        // var desiredName = prompt('Name?');
        var desiredName = "justin" + Math.floor(Math.random() * 1000);

        this.socket.emit('user:new', {
            room: room,
            desiredName: desiredName
        });

    },

    getUserList: function() {
        this.socket.emit('user:list');
    },

    userCreated: function(newUser) {
        this.user.set(newUser);
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
