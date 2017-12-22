RAD.RadCompositeView = Marionette.CompositeView.extend({
    tagName   : 'table',
    className : 'table table-hover',

    // template  : '#ancestor-table-headers',
    initialize : function(options) {
        this.template = TemplateLoader.get('#posts-table-headers');
    },

    onRender : function() {
        // this.collection.mergeParents();
    },

    childView          : RAD.RadItemView,
    childViewContainer : 'tbody'
});
