module.exports = Backbone.Marionette.LayoutView.extend({

    template: '#editor-layout-tpl',

    ui: {
        editors: '[data-editor]',
        jsEditor: '[data-editor="js"]',
        htmlEditor: '[data-editor="html"]',
        cssEditor: '[data-editor="css"]',
        nav: '[data-editor-nav]',
        triggers: '[data-trigger]'
    },

    events: {
        'click @ui.nav [data-trigger]': 'selectEditor'
    },

    initialize: function(options) {
        this.socket = options.socket;
        this.model = new Backbone.Model({active_editor: 'js'});

        this.user = options.user;
        this.editors = {};

        this.setupEvents();
        this.setupSocket();
    },

    onBoundSocket: function(eventName, fn) {
        this.socket.on(eventName, _.bind(fn, this));
    },

    setupSocket: function() {
        this.onBoundSocket('editor:active', this.setActiveEditor);
        this.onBoundSocket('editor:set-contents', this.handleEditorSetContents);
        this.onBoundSocket('editor:provide-contents', this.handleEditorProvideContents);
        this.onBoundSocket('editor:changed', this.handleEditorChange);
        this.onBoundSocket('editor:cursor-change', this.handleCursorChange);
    },

    setupEvents: function() {
        this.listenTo(this.model, 'change:active_editor', this.showEditor);
        this.listenTo(this.user, 'change:active', this.setEditorMode)
        reqres.setHandler('editor:contents', _.bind(this.getEditorContents, this));
    },
    
    onRender: function() {

        var options = { lineNumbers: true };

        var htmlEditor = CodeMirror(this.ui.htmlEditor.get(0), options);
        this.editors.html = htmlEditor;

        var jsEditor = CodeMirror(this.ui.jsEditor.get(0), options);
        this.editors.js = jsEditor;

        var cssEditor = CodeMirror(this.ui.cssEditor.get(0), options);
        this.editors.css = cssEditor;

        _.each(this.editors, function(editor, editorName){
            this.bindEditorEvent(editorName, editor, 'change', this.handleChange);
            this.bindEditorEvent(editorName, editor, 'cursorActivity', this.handleCursorActivity);
        }, this);

        this.showEditor(this.model);
    },

    bindEditorEvent: function(editorName, editor, eventName, callback) {
        callback = _.partial(callback, editorName);
        editor.on(eventName, _.bind(callback, this));
    },

    handleChange: function(editorName, editor, changes) {
        var data = {editor: editorName, changes: changes};
        this.socket.emit('editor:changed', data);
    },

    handleCursorActivity: function(editorName, editor, changes) {

        if (!editor.somethingSelected()) {
            return;
        }

        var changes = {
            start: editor.getCursor(true),
            end: editor.getCursor(false)
        };

        var data = {editor: editorName, changes: changes};
        this.socket.emit('editor:cursor-change', data);
    },

    onShow: function() {
        this.setEditorMode(this.user);
    },

    setActiveEditor: function(activeEditor) {
        console.log('activeEditor', activeEditor);
        this.model.set('active_editor', activeEditor);
    },

    showEditor: function(editorState) {
        var editorName = editorState.get('active_editor')
        this.$el.find('[data-trigger]').removeClass('active');
        this.$el.find('[data-trigger="' + editorName + '"]').addClass('active');
        this.$el.find('[data-editor]').removeClass('active');
        this.$el.find('[data-editor="' + editorName + '"]').addClass('active');
        this.socket.emit('editor:active', editorName);
        this.editors[editorName].focus();
        this.editors[editorName].refresh();
    },

    selectEditor: function(e) {
        this.ui.triggers.removeClass('active');
        $(e.currentTarget).addClass('active');
        this.setActiveEditor($(e.currentTarget).data('trigger'));
    },

    handleEditorSetContents: function(content) {
        for (var editorName in content) {
            this.editors[editorName].setValue(content[editorName]);
        }
    },

    handleEditorProvideContents: function(content) {
        this.socket.emit('editor:provide-contents', this.getEditorContents());
        this.socket.emit('editor:active', this.model.get('active_editor'));
    },

    getEditorContents: function() {
        var contents = {};

        for (var editorName in this.editors) {
            contents[editorName] = this.editors[editorName].getValue();
        }

        return contents;
    },

    handleEditorChange: function(data) {
        var editor = this.editors[data.editor];
        editor.replaceRange(
            data.changes.text.join('\n'), 
            data.changes.from,
            data.changes.to,
            data.changes.origin
        )
    },

    handleCursorChange: function(data) {
        console.log('cursor changed', data);
        var editor = this.editors[data.editor];
        editor.setSelection(data.changes.start, data.changes.end);
    },

    setEditorMode: function(user) {
        _.each(this.editors, function(editor) {
            editor.setOption('readOnly', !user.get('active'));
        })
    },

});
