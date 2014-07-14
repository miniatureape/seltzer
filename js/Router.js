module.exports = Backbone.Router.extend({

    routes: {
        '(/)': "index",
        'create(/)': "create",
        'room/:room(/)': "room",
    }

});
