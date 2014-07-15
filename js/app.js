var Router = require('./Router.js');
var Controller = require('./Controller.js');

window.app = new Backbone.Marionette.Application();

app.show = function() {
    console.log('called');
};

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
