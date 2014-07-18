
module.exports = Backbone.Marionette.LayoutView.extend({

    template: '#room-layout-tpl',

    ui: {
        editors: '[data-editors]',
        jsEditor: '[data-js-editor]',
        htmlEditor: '[data-html-editor]',
        cssEditor: '[data-css-editor]',
        nav: '[data-editor-nav]',
    },

    events: {
        'click @ui.nav li': 'selectEditor'
    },

    onRender: function() {
        var htmlEditor = CodeMirror(this.ui.htmlEditor.get(0));
        var jsEditor = CodeMirror(this.ui.jsEditor.get(0));
        var cssEditor = CodeMirror(this.ui.cssEditor.get(0));
    },

    selectEditor: function(e) {
        this.ui.editors.find('[data-trigger]').removeClass('active');
        var targetEditor = $(e.currentTarget).data('trigger');
        this.ui.editors.find('[data-' + targetEditor + ']').addClass('active');
    },

});
