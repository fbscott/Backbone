
//Utilities needed across all form input applications to handle things like
// 1) errors and messaging
// 2) Put vs Post swap by firstbank
// 3) limiting characters allowed in input fields

(function(root, factory) {

    // If CommonJS
    if (typeof module === 'object' && module.exports) {

        // Export the message Collection
        module.exports = factory(root.Backbone || require('backbone'), // default to global reference for historical reasons
                                root.$ || require('jquery'), // default to global reference for historical reasons
                                require('../models/message.js'),
                                require('../templates/overlay.html'));

    } else {

        //Make sure a global exists
        root.fbAppUtilities = root.fbAppUtilities || {};

        // for global scope, must defer call to TemplateLoader until after application has bootstrapped and called TemplateLoader.init()
        var tmpl = function() { return TemplateLoader.get.apply(this, '#overlay'); };

        // for global scope, must extend the, possibly existing, fbAppUtilities with this context
        _.extend(root.fbAppUtilities, factory(root.Backbone, root.$, root.fbAppUtilities.MessageModel, tmpl));

    }

}(window, function factory(Backbone, $, MessageModel, overlayTemplate) {

    var AppUtilities = {
        self: this,
        config: {
            msToShowError: 20000,
            msToShowSuccess: 7000,
            logoutPage: 'logoff.do',
            omnitureBasePageName: '',
            omnitureChannel: '',
            omnitureProp10: ''
        },
        initCurrencyFields: function() { // used by https://fbscs1.fb/FirstBank/UI-InternetCashManagementAlerts
            // Relies on jquery.formatcurrency
            $('.currency').formatCurrency(); // TODO: jquery.formatcurrency plugin does not currently support CommonJS modules; how to handle for CommonJS?
            $('.currency').on('blur', function() {
                $(this).formatCurrency();
            });
        },
        showLoadingOverlay: function(el){ // used by https://fbscs1.fb/FirstBank/UI-InternetCashManagementStops
            var $el = $(el);
            // TODO: PUt in logic to check for overlay and hide/show or logic to remove it

            $el.wrap('<div class="wrapper" style="position:relative; display: inline-block;"></div>');
            //$el.wrap('<div class="wrapper" style="position:relative; height: ' + $el.height() + '; width: ' + $el.width() + '; display: inline-block;"></div>');
            $el.parent().append(self.overlayTemplate());
        },
        removeLoadingOverlay: function(el){ // used by https://fbscs1.fb/FirstBank/UI-InternetCashManagementStops
            $(el).siblings('.overlay').remove();
            $(el).unwrap();
        },
        ajaxErrorHandler: function(event, jqXHR, ajaxSettings, thrownError){ // used by https://fbscs1.fb/FirstBank/UI-InternetCashManagementStops
            var _this = this;
            var objAttributes = {};
            var message;

            objAttributes.isError = true;

            if (jqXHR.status){
                objAttributes.code = jqXHR.status;
            }

            if (jqXHR.statusText){
                objAttributes.statusCodeDescription = jqXHR.statusText;
            }

            if (jqXHR.responseJSON ){
                if (jqXHR.responseJSON.statusCodeDescription){
                    objAttributes.statusCodeDescription = jqXHR.responseJSON.statusCodeDescription;
                }
                if (jqXHR.responseJSON.code){
                    objAttributes.code = jqXHR.responseJSON.code;
                }
                if (jqXHR.responseJSON.message){
                    objAttributes.message = jqXHR.responseJSON.message;
                }
                if (jqXHR.responseJSON.suggestedAction){
                    objAttributes.suggestedAction = jqXHR.responseJSON.suggestedAction;
                }
            }

            // If we fail to parse JSON, consider this a critial (application closing) error
            // TODO: is there a better way to key off of this?
            // TODO: What's the logout url
            if (thrownError.name && thrownError.name === 'SyntaxError' && thrownError.stack && thrownError.stack.indexOf('parseJSON') !== 0){
                window.location = rootAppURL + '/' + _this.config.logoutPage;
            }

            if (thrownError.stack){
                objAttributes.stack =  thrownError.stack;
            }

            message = new self.MessageModel(objAttributes);

            fbAppUtilities.messageCollection.add(message); // TODO: how to deal with this global reference to an instantiated message collection in CommonJS?

            // TODO: Are we ok with keying off of a text message? Should it be a number?
            if (objAttributes.messageCollection === 'rqi check failed'){
                window.location = rootAppURL + '/' + _this.config.logoutPage;
            }

        },
        generateTimestamp: function(){ // used by https://fbscs1.fb/FirstBank/UI-SecureApplicationsProductAndPricing, https://fbscs1.fb/FirstBank/UI-Common, https://fbscs1.fb/FirstBank/UI-OnlineCommunicationCenter, https://fbscs1.fb/FirstBank/UI-SecureApplicationsLoanAndMortgageApplication, https://fbscs1.fb/FirstBank/UI-CardManagement
            return new Date();
        },
        remapBackboneSyncVerbs: function(){ // used by all SPAs
            //Need to remap the Backbone.sync to fit FirstBank's model
            //FirstBank REST            standard REST
                //POST = update         //POST = create
                //PUT = create          //PUT = update

            // Keep the old sync, we still want to use it.
            if (!Backbone.originalSync){
                // Only do this once
                Backbone.originalSync = Backbone.sync;

                // Add a layer to translate the create and update verbs to our standards.
                Backbone.sync = function(method, model, options) {

                    var fbMethodMap = {
                      'create': 'update',
                      'update': 'create',
                      'patch': 'patch',
                      'delete': 'delete',
                      'read': 'read'
                    };

                    return Backbone.originalSync.apply(this, [fbMethodMap[method], model, options]);
                };
            }

        },

    /**
     * NOT deprecated as IE11 emits an input type event on focusin/focusout of input form fields that have a placeholder attribute.
     * Utility method to limit textinput, pass in input type (maps to a regex) so it is configurable. Must have tab and backspace there for FF.  Or FF wont allow you to tab out or delete
     * Called from keypress event.
     *example usage
     *put a class on each input field to define the type you want: .decimal, .posint, .currency, .alpha
     * bind each class to the appropriate inputType
     * $('.currency').keypress({inputType: "CURRENCY"}, fbAppUtilities.limitInput);
     * $('.alpha').keypress({inputType: "ALPHA"}, fbAppUtilities.limitInput);
     */
       limitInput: function (evt) { // used by a lot of SPAs

            var expression;//evt.data.inputType reads the data passed to this event handler
            if (evt) {
                switch (evt.data.inputType) {//NOTE: can't use quotes around regex expression or it breaks
                    case 'POSINT': expression = /[\D\s\b]/g; break;
                    case 'DECIMAL': expression = /[^0-9,.\s\b]/g; break;
                    case 'CURRENCY': expression = /[^0-9,.$\s\b]/g; break;
                    case 'ALPHA': expression = /[^a-zA-Z \b]/g; break;
                    case 'DATES': expression = /[^0-9-\/\s\b]/g; break;
                }
                var theEvent = evt || window.event;
                var keyCode = theEvent.keyCode || theEvent.which; //ie vs other browsers
                var key = String.fromCharCode(keyCode);
                if (theEvent.ctrlKey || theEvent.altKey || theEvent.metaKey || keyCode < 32) {
                    return; // ignore most control keys; fails for arrow keys which require binding to keydown event instead of keypress
                } else if (expression.test(key)) {//look at the regex
                    theEvent.returnValue = false;//dont allow the key to be entered
                    if (theEvent.preventDefault) {
                        theEvent.preventDefault();
                    }
                }
            }
        },
        // Clear var function for SPA reporting following Adobe Documentation and clearing out props and vars
        // before sending new page view.
        // From: StackOverflow: http://stackoverflow.com/questions/7692746/javascript-omniture-how-to-clear-all-properties-of-an-object-s-object
        // May not need for jQuery but does not hurt to have just in case.
        clearOmnitureVars: function(){ // used by https://fbscs1.fb/FirstBank/UI-OnlineBankingPersonToPerson
            for (var i=0; i < 75; i++) {
                s['prop'+i]='';
                s['eVar'+i]='';
                if(i<=5){
                    s['hier'+i]='';
                }
            }
                svarArr = ['pageName','channel','products','events','campaign','purchaseID','state','zip','server','linkName'];
            for (i=1; i < svarArr.length ; i++) {
                s[svarArr[i]]='';
            }
        },
        // Creating re-usable omniture function that can be launched from any page in the app.
        //  Working to reduce reduntant code and enforce D-R-Y principles more heavily.
        //  When a click needs to be reported the page responsibly for said event
        //  will launch the following function passing in data pertinant to said page.
        //  Luckily working in JavaScript does not require that all variables are present
        //  with the exception of the first which should always be included.
        //  eStatements only requires the reporting of a page view -> But should
        //  have some re-usability to tracking page clicks.  Possibly adding in
        //  additional parameter, for whoever is responsible for a new event on screen
        omnitureReport: function(referingPage, location, subLocation) { // used by https://fbscs1.fb/FirstBank/UI-OnlineBankingPersonToPerson
            var _this = this;

            //Run seperate function that will empty out the omniture variables.
            // When page view is run on Adobe server it will appear fresh.
            s.pageName = _this.config.omnitureBasePageName + ': ' + referingPage; // Will reduce amount needed to write to function by pre-declaring constant values.
            s.channel = _this.config.omnitureChannel; //Constant will always be coming from Mobile Banking side
            s.prop7 = _this.config.omnitureBasePageName; // Level 1: // Parent Page of SPA
            s.prop8 = (subLocation) ? subLocation : '';  // Level 2: If there is a sub-location existing print it to omniture tracking else hand-off empty string
            s.prop10 = _this.config.omnitureProp10; // Marketing Site, Mobile Banking, or Internet Banking Refer -> Will be set at a constant depending on application usage.
            var s_code=s.t(); if(s_code)document.write(s_code); //Final line that will send all data to Omniture -> because statement is encapsulated in function may need to move it to the return line.
        },

        /**
         * Update to the legacy Omniture function leverage fbanalytics and use it to map to reporting variables
         */
        omnitureLegacywithData: function() { // used by https://fbscs1.fb/FirstBank/UI-OnlineCommunicationCenter

            // Clear out any data that may persist
            AppUtilities.clearOmnitureVars();

            s.pageName = window.digitalData.page.pageInfo.pageName;
            s.channel  = window.digitalData.page.category.primaryCategory;
            s.prop7    = window.digitalData.page.category.subCategory1;
            s.prop8    = window.digitalData.page.category.subCategory2;
            s.prop9    = window.digitalData.page.category.subCategory3;
            s.prop10   = window.digitalData.page.pageInfo.environmentName;

            var s_code=s.t(); if(s_code)document.write(s_code); //Final line that will send all data to Omniture -> because statement is encapsulated in function may need to move it to the return line.

        },

        // This function is used for inheritence and can be used as a replacement for the native (javascript) constructor, this will to populate
        // data and functionality on a child object. It is doing a deep jquery extend on all non-function objects and is leaving any overrides
        // of functions on the child alone.
        //
        // The expected structure in the parent class is to have a base object with everything that you want inherited into the child instances.
        //
        // Examples of this are the baseCommunication model and baseView view in Online Communication Center.
        //
        // In the child you'll need to override the native constructor with :
        //      constructor : function() {
        //          return fbAppUtilities.childOverrideConstructor.apply(this, arguments);
        //      }
        //
        // NOTE: I'm not sure if this is an issue, or if this is correct, and to be honest, I'm not sure I have an 100% grasp of all the moving peices, but here is an quirk/issue (as I best understand it):
        //      If your parent object (lets say OCC.CommunicationBaseModel) extends another granparent object (Backbone.Model) by the ParentObject = GrandparentObject.extend ({})
        //      syntax, you'll get all the functions on the Grandparent as part of the child before this override takes place. This means that in the scenario above, you'll get the
        //      native parse on the Backbone.Model as an inherited property on your object (via prototype chain) and this logic will not override that with the parent (OCC.baseCommunication)
        //      version of parse. This specific issue can be resolved by only looking at keys on this object for comparison (_.keys(this) instead of _.allKeysThis), but that creates other
        //      issues. The solution/work-around is to explicitely call or override the grandparent function in the child with the parents (if that's your goal). This is the reason for:
        //          parse: function() {
        //              return this.base.parse.apply(this, arguments);
        //          }
        //      in the task class.
        childOverrideConstructor: function(){ // used by https://fbscs1.fb/FirstBank/UI-OnlineCommunicationCenter

            var _this = this,
                myProperties = _.keys(this.constructor.prototype),
                myFunctions = _.filter(myProperties, function(key){return _.isFunction(_this[key]);});

            // Extend this with its base, excluding functions defined here.
            $.extend(true, this, _.omit(this.base, myFunctions));

            return this.constructor.__super__.constructor.apply(this, arguments);

        }

    };

    return AppUtilities;

}));