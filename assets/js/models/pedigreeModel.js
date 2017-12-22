RAD.AncestorModel = Backbone.Model.extend({

    defaults : {
        firstName  : '',
        middleName : '',
        lastName   : '',
        father     : '',
        mother     : '',
        terms      : '',
        vicePres_1 : {
            'firstName'  : 'N/A',
            'middleName' : '',
            'lastName'   : ''
        },
        vicePres_2 : {
            'firstName'  : '',
            'middleName' : '',
            'lastName'   : ''
        },
        vicePres_3 : {
            'firstName'  : '',
            'middleName' : '',
            'lastName'   : ''
        }
    },

    initialize : function() {
        console.log('Model: RAD.AncestorModel has been initialize.');
    }

});
