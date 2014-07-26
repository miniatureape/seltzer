module.exports = Backbone.Marionette.LayoutView.extend({
    className: 'user-list',

    template: '#userlist-layout-tpl',

    regions: {
        list: '[data-user-list]'
    },

    initialize: function(options) {
        this.users = options.users;
        this.listenTo(this.users, 'add', this.addUser);
        this.listenTo(this.users, 'remove', this.removeUser);
    },

    removeUser: function() {
        console.log('remove user');
    },

    addUser: function() {
        console.log('add user');
    }

});
