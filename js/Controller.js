var RoomModule = require('./modules/RoomModule');

var Controller = function(socket) {
    this.socket = socket;
};

Controller.prototype = {

    init: function(router) {
        this.attachRoutes(router);
        Backbone.history.start({ pushState: true });
    },

    attachRoutes: function(router) {
        for (var route in this) {
            if (route.indexOf('route:') === 0) {
                router.on(route, _.bind(this[route], this));
            }
        }
    },

    'route:index': function() {
        console.log('index');
    },

    'route:create': function() {
        console.log('create');
    },

    'route:room': function(room) {
        var roomModule = new RoomModule(this.socket);
        roomModule.start(room);
        debugger;
        app.show(roomModule.getLayout());
    }

}

module.exports = Controller;
