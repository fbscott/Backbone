RAD.Controller = {

    placeholderPosts : function() {

        var radCollection = new RAD.RadCollection();
        var df1 = $.Deferred(); // jsonplaceholder API data

        radCollection.fetch({global:false}).always(df1.resolve);

        // radCollection.fetch()
        //     .done(function() {
        //         var radView = new RAD.RadCompositeView({
        //                               collection: radCollection
        //                           });
        //         console.log('before');
        //         RAD.mainView.screenRegion.show(radView);
        //         console.log('after');
        //     });

        $.when(df1).done(function() {
            var radView = new RAD.RadCompositeView({
                                  collection: radCollection
                              });
            console.log('before');
            RAD.mainView.screenRegion.show(radView);
            console.log('after');
        });

        console.log('Controller: placeholderPosts has been called.');

    }

};
