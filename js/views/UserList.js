var UserNameView = require('./UserNameView');

module.exports = Backbone.Marionette.CollectionView.extend({

    childView: UserNameView,

    initialize: function(options) {
        this.user = options.user;
        this.listenTo(this.collection, 'add remove', this.render);
        this.listenTo(this.collection, 'change:is_logged_in_user', this.render);
    },

});
