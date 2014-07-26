var UserNameView = require('./UserNameView');

module.exports = Backbone.Marionette.CollectionView.extend({

    childView: UserNameView,

    initialize: function() {
        this.listenTo(this.collection, 'add remove', this.render);
    }
});
