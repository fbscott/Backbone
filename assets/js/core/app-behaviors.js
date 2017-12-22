/*
 *  To add button spinners to a view, define a behaviors hash in your view with an optional selector value:
 *  behaviors : {
 *      ViewRatesButton : {
 *          behaviorClass   : fbAppBehaviors.LaddaButtonBehavior,
 *          selector        : '#submit' // optional; defaults to 'button'
 *      }
 *  }
 *
 * To start the button spinner, use view.triggerMethod('spinnerStart').
 *
 * To stop the button spinner, use view.triggerMethod('spinnerStop').
 *
 * Note: Ladda button must be a button element and include the 'ladda-button' class as follows:
 *   <button class="ladda-button" data-style="expand-right"><span class="ladda-label">Submit</span></button>
 * More docs here: https://github.com/hakimel/Ladda
 */


(function(root, factory) {

    // If CommonJS
    if (typeof module === 'object' && module.exports) {

        // Export AppBehaviors
        module.exports = factory(root.Marionette || require('backbone.marionette'), // default to global reference for historical reasons
                                root._ || require('underscore'), // default to global reference for historical reasons
                                require('ladda'),
                                require('spin.js'));

    } else {

        //Make sure a global exists
        root.fbAppBehaviors = root.fbAppBehaviors || {};

        //Attach the behaviors
        _.extend(root.fbAppBehaviors, factory(root.Marionette, root._, root.Ladda, root.Spinner));

    }

}(window, function factory(Marionette, _, Ladda, Spinner) {

    var AppBehaviors = {};

    AppBehaviors.LaddaButtonBehavior = Marionette.Behavior.extend({

        styles : ['expand-left','expand-right','expand-up','expand-down','contract','contract-overlay','zoom-in',
                'zoom-out','slide-left','slide-right','slide-up','slide-down'],

        defaults : {
            'selector'              : 'button',
            'data-style'            : 'zoom-in',
            'data-spinner-color'    : '#333'
        },

        events : function() {
            var evt = {};
            evt['click ' + this.options.selector] = '_spinnerStart';
            return evt;
        },

        initialize : function(options) {

            // keep only whitelisted keys in the options object
            this.options = _.defaults({},
                    _.pick(options, 'selector', 'data-style', 'data-spinner-color'),
                    this.defaults);

            // only valid values for data-style allowed
            if (!_.contains(this.styles, this.options['data-style'])) {
                this.options['data-style'] = this.defaults['data-style'];
            }
        },

        /*
         * onRender setups attributes correctly on button according to the Ladda docs:
         *
         * [Source: https://github.com/hakimel/Ladda#html] Ladda buttons must be given the class ladda-button and
         * the button label needs to have the ladda-label class. The ladda-label will be automatically created if
         * it does not exist in the DOM. Below is an example of a button which will use the expand-right animation
         * style.
         *
         * <button class="ladda-button" data-style="expand-right"><span class="ladda-label">Submit</span></button>
        */
        onRender : function() {

            // initialize all of our ladda buttons with the correct CSS class and attributes
            this.$(this.options.selector)
                .addClass('ladda-button')
                    .attr(_.pick(this.options, 'data-style', 'data-spinner-color'))
                        .wrapInner('<span class="ladda-label"></span>');
        },

        _spinnerStart : function(event) {
            var $elem = this.$(event.target).closest(this.options.selector);

            // instantiate a new ladda spinner for the clicked element
            this.view.ladda = Ladda.create($elem[0]); // TODO: need some existence checking

            // on spinnerStart events, start spinners on all DOM elements matched by 'selector' attribute
            this.view.ladda.start();
        },

        onSpinnerStop : function() {

            // on spinnerStop events, stop spinners on all DOM elements matched by 'selector' attribute
            if (!!this.view.ladda) {
                this.view.ladda.stop();
            }
        }

    });

    /*
     *  To add wait load spinners to a view, define a behaviors hash in your view with an optional selector value:
     *  behaviors : {
     *      ViewRatesButton : {
     *          behaviorClass   : fbAppBehaviors.SpinnerBehavior,
     *          size            : 'small', // optional; defaults to 'large'
     *          color           : '#777777', // optional defaults to '#e6771e'
     *          selector        : '.js-inline-loader' // optional; defaults to '.page-overlay'
     *      }
     *  }
     *
     * To start the button spinner, use view.triggerMethod('loaderStart').
     *
     * To stop the button spinner, use view.triggerMethod('loaderStop').
     *
     * One spinner per view is expected.
     *
     * More docs here: http://spin.js.org/
     */
    AppBehaviors.SpinnerBehavior = Marionette.Behavior.extend({

        defaults : {
            size                : 'large',
            color               : '#e6771e',    // #rgb or #rrggbb or array of colors
            selector            : '.element-overlay'
        },

        configs : {
            large : {
                length  : 20,           // The length of each line
                width   : 10,           // The line thickness
                radius  : 30            // The radius of the inner circle
            },

            medium : {
                length  : 10,           // The length of each line
                width   : 5,            // The line thickness
                radius  : 15            // The radius of the inner circle
            },

            small : {
                length  : 4,            // The length of each line
                width   : 2,            // The line thickness
                radius  : 6             // The radius of the inner circle
            }
        },

        initialize : function(options) {

            // setup base configuration for page loader and add color and position to the configuration object
            this.configBase = _.extend({},
                this.configs[this.options.size],
                {color   : this.options.color}
            );
        },

        onLoaderStart : function() {
            this.$(this.options.selector).show();
            this.view.spinner = new Spinner(this._configure()).spin();
            this.$(this.options.selector).append(this.view.spinner.el);
        },

        onLoaderStop : function() {
            this.$(this.options.selector).hide();
            if (!!this.view.spinner) {
                this.view.spinner.stop();
            }
            this.$(this.options.selector).empty();
        },

        // TODO: bind spinner start to this.view.onDomRefresh() and stop to this.view.onDestroy()

        _configure : function() {

            // setup the spinner by extending the config base and adding position to the config object
            return _.extend({},
                this.configBase
            );
        }

    });

    return AppBehaviors;

}));