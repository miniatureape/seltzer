var UserListLayout = require('./UserListLayout');
var EditorLayout = require('./EditorLayout');
var PreviewPaneLayout = require('./PreviewPaneLayout');

module.exports = Backbone.Marionette.LayoutView.extend({

    className: 'room-module',

    template: '#room-layout-tpl',

    regions: {
        editors: '[data-editors]',
        userList: '[data-user-list-region]',
        previewPane: '[data-preview-pane]',
    },

    initialize: function(options) {
        _.bindAll.apply(_, [this].concat(_.functions(this)));
        this.socket = options.socket;
        this.user = options.user;
        this.users = options.users;
        this.applicationState = options.applicationState;
        this.setupEvents();
    },

    onShow: function() {
        this.getRegion('userList').show(new UserListLayout({
            users: this.users,
            user: this.user
        }));
        this.getRegion('previewPane').show(new PreviewPaneLayout());
        this.getRegion('editors').show(new EditorLayout({
            socket: this.socket,
            user: this.user,
        }));
    },

    setupEvents: function() {
        this.listenTo(this.applicationState, 'change:connected', this.setConnectionStatus);
    },

    setConnectionStatus: function() {
        this.$el.toggleClass('connected', this.applicationState.get('connected'));
    },

});
