RAD.AncestorsCollection = Backbone.Collection.extend({

    model : RAD.AncestorModel,

    // Sort alphabetically
    // comparator : function(sort) {
    //     return sort.get("lastName") + " " + sort.get("firstName");
    // }

    // Sort by id
    comparator : 'id',

    initialize : function() {
        console.log('Collection: RAD.AncestorsCollection has been initialize.');
    },

    // Merge parent names with current model
    mergeParents : function() {

        _.each(this.models, function(item) {
            var _fatherId = item.get('father');
            var _motherId = item.get('mother');
            var _father = this.getParent(_fatherId);
            var _mother = this.getParent(_motherId);

            item.set({
                father : _father,
                mother : _mother
            });

        }, this);

        return this;

    },

    // Find if the current collection contains a parent
    getParent : function(parentId) {
        var _parentId = parentId;
        var _parent   = this.findWhere({id : _parentId});

        if (!!_parent) {
            return _parent.get('firstName') + ' ' + _parent.get('middleName') + ' ' + _parent.get('lastName');
        } else {
            return '';
        }
    }

});
