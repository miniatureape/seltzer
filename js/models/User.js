var Backbone = require('../lib/backbone');

module.exports = Backbone.Model.extend({

    defaults: {
        name: '',
        active: false,
        leader: false,
        needs_content: true,
        is_logged_in_user: false,
    },

});
