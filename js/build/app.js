(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var RoomModule = require('./modules/RoomModule');

var Controller = function(socket) {
    this.socket = socket;
};

Controller.prototype = {

    init: function(router) {
        this.attachRoutes(router);
        Backbone.history.start({ pushState: true });
    },

    attachRoutes: function(router) {
        for (var route in this) {
            if (route.indexOf('route:') === 0) {
                router.on(route, _.bind(this[route], this));
            }
        }
    },

    // Routes

    'route:index': function() {
        console.log('index');
    },

    'route:create': function() {
        console.log('create');
    },

    'route:room': function(room) {
        var roomModule = new RoomModule(this.socket);
        roomModule.start(room);
        app.showBody(roomModule.getLayout());
    }

}

module.exports = Controller;

},{"./modules/RoomModule":4}],2:[function(require,module,exports){
module.exports = Backbone.Router.extend({

    routes: {
        '(/)': "index",
        'create(/)': "create",
        'room/:room(/)': "room",
    }

});

},{}],3:[function(require,module,exports){
var Router     = require('./Router.js');
var Controller = require('./Controller.js');
var AppLayout  = require('./views/AppLayout.js');

window.app = new Backbone.Marionette.Application();
app.addRegions({ appRegion: '#app' });
var appLayout = new AppLayout();
app.appRegion.show(appLayout);

app.showBody = function(view) {
    app.appRegion.currentView.body.show(view);
}

var socket = io.connect('http://localhost');
var router = new Router();

var controller = new Controller(socket);
controller.init(router);

    /*

    editor = CodeMirror(document.body);

    editor.on('change', function(editor, changes) {
        if (socket && socket.emit) {
            socket.emit('editor:changed', changes);
        }
    });

    socket.on('connect', function() {
        if (!user) {
            socket.emit('user:new', desiredName);
        }
    });

    socket.on('connect_error', function() {
        console.log('connect_error', arguments);
    });

    socket.on('reconnect', function() {
        console.log('reconnect', arguments);
    });

    socket.on('reconnect_attempt', function() {
        console.log('reconnect_attempt', arguments);
    });

    socket.on('reconnecting', function() {
        console.log('reconnecting', arguments);
    });

    socket.on('reconnect_failed', function() {
        console.log('reconnect_failed', arguments);
    });

    socket.on('user:created', function(newUser) {
        user = newUser;
        console.log('user is', user);
    });

    socket.on('editor:get-contents', function() {
        var content = editor.getValue();
        console.log('requested content', content);
        socket.emit('editor:active-contents', content);
    });

    socket.on('editor:active-contents', function(contents) {
        console.log('setting contents', contents);
        editor.setValue(contents);
    });

    socket.on('editor:changed', function(args) {
        console.log('changed', args);
    });
    */

},{"./Controller.js":1,"./Router.js":2,"./views/AppLayout.js":5}],4:[function(require,module,exports){
var RoomLayout = require('../views/RoomLayout');

var RoomModule = function(socket) {
    this.socket = socket;
    this.layout = new RoomLayout({socket: this.socket});

};

RoomModule.prototype = {

    start: function(room) {
        this.room = room;
        this.user = null;

        _.bindAll.apply(_, [this].concat(_.functions(this)));

        this.setupSocket();
    },

    setupSocket: function() {
        this.socket.on('connect', this.requestNewUser);
        this.socket.on('user:created', this.userCreated);
        this.socket.on('room:404', this.room404);
    },

    requestNewUser: function(room) {
        var desiredName = prompt('Name?');

        this.socket.emit('user:new', {
            room: room,
            desiredName: desiredName
        });

    },

    userCreated: function(newUser) {
        console.log(newUser);
        this.user = newUser;
        if (!this.user.isActive) {
            this.socket.emit('editor:get-contents');
        }
    },

    room404: function(room) {
        console.error('Room does not exist', room);
    },

    userNameTaken: function() {
        console.error('User name is already taken');
        this.requestNewUser();
    },

    getLayout: function() {
        return this.layout;
    }

};

module.exports = RoomModule;

},{"../views/RoomLayout":6}],5:[function(require,module,exports){

var AppLayout = Backbone.Marionette.LayoutView.extend({

    template: '#app-layout-tpl',

    regions: {
        body: '#app-body',
    }

});

module.exports = AppLayout;

},{}],6:[function(require,module,exports){

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

},{}]},{},[3])