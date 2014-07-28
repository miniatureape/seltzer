var UserList = require('./UserList');

module.exports = Backbone.Marionette.LayoutView.extend({

    template: '#userlist-layout-tpl',

    regions: {
        list: '[data-user-list]'
    },

    initialize: function(options) {
        this.users = options.users;
        this.user = options.user;
        this.listenTo(this.users, 'add remove', this.render);
    },

    onShow: function() {
        this.getRegion('list').show(new UserList({
            collection: this.users,
            user: this.user
        }))
    },

});
