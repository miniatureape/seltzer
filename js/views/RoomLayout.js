
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
        _.bindAll.apply(_, [this].concat(_.functions(this)));
        this.socket = options.socket;
        this.model = new Backbone.Model({active_editor: 'js'});
        this.setupEvents();
        this.setupSocket();
    },

    setupSocket: function() {
        this.socket.on('editor:active', this.setActiveEditor);
        this.socket.on('editor:set-contents', this.handleEditorSetContents);
        this.socket.on('editor:provide-contents', this.handleEditorProvideContents);
    },

    setupEvents: function() {
        this.listenTo(this.model, 'change:active_editor', this.showEditor);
    },

    onRender: function() {
        this.editors = {};

        var htmlEditor = CodeMirror(this.ui.htmlEditor.get(0));
        this.editors.html = htmlEditor;
        htmlEditor.on('change', this.handleHtmlChange);

        var jsEditor = CodeMirror(this.ui.jsEditor.get(0));
        this.editors.js = jsEditor;
        jsEditor.on('change', this.handleJsChange);

        var cssEditor = CodeMirror(this.ui.cssEditor.get(0));
        this.editors.css = cssEditor;
        cssEditor.on('change', this.handleCssChange);

        this.showEditor(this.model);
    },

    setActiveEditor: function(activeEditor) {
        this.model.set('active_editor', activeEditor);
    },

    showEditor: function(editor) {
        var editorName = editor.get('active_editor')
        this.ui.editors.find('[data-editor]').removeClass('active');
        this.ui.editors.find('[data-editor="' + editorName + '"]').addClass('active');
        this.socket.emit('editor:active', editorName);
    },

    selectEditor: function(e) {
        this.setActiveEditor($(e.currentTarget).data('trigger'));
    },

    handleHtmlChange: function(editor, changes) {
        this.socket.emit('editor:changed:html', changes);
    },

    handleCssChange: function(editor, changes) {
        this.socket.emit('editor:changed:css', changes);
    },

    handleJsChange: function(editor, changes) {
        this.socket.emit('editor:changed:js', changes);
    },

    handleEditorSetContents: function(content) {
        for (var editorName in content) {
            this.editors[editorName].setValue(content[editorName]);
        }
    },

    handleEditorProvideContents: function(content) {
        this.socket.emit('editor:provide-contents', this.getEditorContents());
    },

    getEditorContents: function() {
        var contents = {};

        for (var editorName in this.editors) {
            contents[editorName] = this.editors[editorName].getValue();
        }

        return contents;
    }

});
