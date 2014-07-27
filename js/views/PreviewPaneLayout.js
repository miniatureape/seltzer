module.exports = Backbone.Marionette.LayoutView.extend({

    template: '#preview-pane-tpl',

    ui: {
        iframe: 'iframe',
        runButton: '[data-run-btn]'
    },

    events: {
        'click @ui.runButton': 'showPreview'
    },

    initialize: function() {
        this.ifdTpl = _.template($('#iframe-doc-tpl').html());
    },

    onShow: function() {
        console.log('iframe showing!');
    },

    showPreview: function() {
        var contents = reqres.request('editor:contents');
        this.setFrameContents(contents);
    },

    setFrameContents: function(contents) {
        var ifd = this.ui.iframe.get(0).contentWindow.document;
        ifd.open('text/html', 'replace');
        ifd.write(this.ifdTpl(contents));
        var scriptTag = "<script>" + contents.js + "</script>";
        $(ifd.body).append(scriptTag);
        ifd.close();
    }

});
