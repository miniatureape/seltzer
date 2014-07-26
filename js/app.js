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
