RAD.RadItemView = Marionette.ItemView.extend({

    tagName  : 'tr',

    events : {
        'click'                  : 'highlightName',
        'mouseover td'           : 'logText',
        'click button.js-delete' : 'deleteRow'
    },

    initialize : function(options) {
        this.template = TemplateLoader.get('#posts-table-row');
        this.model.on('change', this.render, this);
    },

    highlightName : function() {
        this.$el.toggleClass('warning');
    },

    logText : function(event) {
        console.table($(event.target).text());
    },

    deleteRow : function(e) {
        e.stopPropagation();
        console.log('Clicked');
        this.model.collection.remove(this.model);
    }
});
