RAD.RadCollection = Backbone.Collection.extend({

    model : RAD.RadModel,

    url : 'https://jsonplaceholder.typicode.com/posts',

    initialize : function() {
        console.log('Collection: RAD.RadCollection has been initialize.');
    }

});
