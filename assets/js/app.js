_.extend(RAD, {

    initializeApp: function() {
        TemplateLoader.init();
        // TemplateLoader.init('[type="text/html"]', 'srcTmpl');
    }
});

RAD.initializeApp();

RAD.on('start', function() {
    // var rad              = new RAD.RadCollection(RAD.AncestorsJSON);
    var rad              = new RAD.RadCollection();
    var radCompositeView = new RAD.RadCompositeView({
      collection : rad
    });

    RAD.mainRegion.show(radCompositeView);
});

$(document).ready(function() {

    RAD.start();

});
