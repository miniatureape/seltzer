var Backbone = require('../lib/backbone');
var User = require('./User');

var Users = Backbone.Collection.extend({

    model: User,

    nameExists: function(name) {
        return this.findWhere({name: name});
    },

    setActive: function(user) {
        var prevActive = this.findWhere({active: true});
        if (prevActive) {
            prevActive.set(active, false);
        }
        user.set('active', true);
    },

    needingContent: function() {
        return this.find({needs_content: true});
    },

});

module.exports = Users;
