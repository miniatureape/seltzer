var Backbone = require('../lib/backbone');

module.exports = Backbone.Model.extend({

    defaults: {
        name: '',
        active: false,
        needs_content: true,
    },

});
