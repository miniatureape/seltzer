var RoomLayout = require('views/RoomLayout');

var RoomModule = function(socket) {
    this.socket = socket;
};

RoomModule.prototype = {

    start: function(room) {

        this.room = room;

        var view = new RoomLayout();

        _.bindAll.apply(_, [this].concat(_.functions(this)));
        this.socket.on('connect', this.requestNewUser);
        this.socket.on('user:created', this.userCreated);
        this.socket.on('room:404', this.room404);

    },

    requestNewUser: function(room) {
        var desiredName = prompt('Name?');

        this.socket.emit('user:new', {
            room: room,
            desiredName: desiredName
        });
    },

    userCreated: function(newUser) {
        console.log(newUser);
    },

    room404: function(room) {
        console.error('Room does not exist', room);
    },

    userNameTaken: function() {

    },

};

module.exports = RoomModule;
