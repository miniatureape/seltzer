
module.exports = Backbone.Marionette.LayoutView.extend({

    template: '#room-layout-tpl',

    ui: {
        editors: '[data-editors]',
        jsEditor: '[data-editor="js"]',
        htmlEditor: '[data-editor="html"]',
        cssEditor: '[data-editor="css"]',
        nav: '[data-editor-nav]',
    },

    events: {
        'click @ui.nav li': 'selectEditor'
    },

    initialize: function(options) {
        this.socket = options.socket;
        this.model = new Backbone.Model;
        this.listenTo(this.model, 'change:active_editor', this.showEditor);
    },

    onRender: function() {
        var htmlEditor = CodeMirror(this.ui.htmlEditor.get(0));
        var jsEditor = CodeMirror(this.ui.jsEditor.get(0));
        var cssEditor = CodeMirror(this.ui.cssEditor.get(0));
        this.showEditor('js');
    },

    showEditor: function(editor) {
        if (!_.isString(editor)) editor = editor.get('active_editor');
        this.ui.editors.find('[data-editor]').removeClass('active');
        this.ui.editors.find('[data-editor="' + editor + '"]').addClass('active');
    },

    selectEditor: function(e) {
        this.model.set('active_editor', $(e.currentTarget).data('trigger'))
    },

});
