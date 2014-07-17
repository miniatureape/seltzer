
var AppLayout = Backbone.Marionette.LayoutView.extend({

    template: '#app-layout-tpl',

    regions: {
        body: '#app-body',
    }

});

module.exports = AppLayout;
