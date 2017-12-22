/*
 * Asynchronous Template loader using the JavaScript Revealing Module pattern.
 *
 * Utility method for async loading Backbone template files.
 *
 * Template files declaration:
 * <script type="text/html" id="app-base-view" srcTmpl="/apps/secapps/pnp/_assets/js/templates/app-base-view.html"></script>
 *
 * NOTE: the "id" attribute value MUST BE the same as the file name minus the file extension or the build/deploy will break.
 *
 * TemplateLoader must be initialized first:
 * TemplateLoader.init('[type="text/html"]', 'srcTmpl');
 *
 * To fetch pre-compiled template, call the get function:
 * TemplateLoader.get('#app-base-view');
 *
 * Sources:
 * * http://stackoverflow.com/questions/7542089/best-way-to-load-asynchronously-undescore-templates#7542468
 * * http://lostechies.com/derickbailey/2012/02/09/asynchronously-load-html-templates-for-backbone-views/
 */

var TemplateLoader = (function() {

    var _initialized = false;

    _.extend(_.templateSettings, {
        variable : 'data'
    });

    var _load = function(templateId, templateUrl) {
        $.ajax({
            url : templateUrl,
            async : false
        }).done(function(resp) {
            _add(resp, templateId);
        });
    };

    var _add = function(template, templateId) {
        TemplateLoader[templateId] = _.template(template, false, { variable : 'data' });
    };

    return {
        init : function(selector, srcAttr) {
            if (_initialized) { throw "TemplateLoader.init() should be called only once."; }
            var shouldInitialize = true;
            for (var prop in TemplateLoader) {
                if (TemplateLoader.hasOwnProperty(prop) && prop !== 'init' && prop !== 'get') {
                    shouldInitialize = false;
                }
            }
            if (shouldInitialize) {
                selector = (_.isUndefined(selector) || !_.isString(selector) || selector === '') ? '[type="text/html"]' : selector;
                srcAttr = (_.isUndefined(selector) || !_.isString(srcAttr) || srcAttr === '') ? 'srcTmpl' : srcAttr;
                $(selector).each(function(index, element) {
                    _load($(this).attr('id'), $(this).attr(srcAttr));
                });
            }
            _initialized = true;
        },

        get : function(templateId) {
            if (!_initialized) { throw "TemplateLoader.init() must be called first."; }
            templateId = templateId.replace('#', '');
            return this[templateId] ? this[templateId] : void 0;
        }
    };

})();
