angular.module('ngFabForm')
    .provider('ngFabForm', function ngFabFormProvider()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
            // validation template-url/templateId
            // to disable validation completely set it false
            validationsTemplate: 'default-validation-msgs.html',

            // prevent submission of invalid forms
            preventInvalidSubmit: true,

            // prevent double clicks
            preventDoubleSubmit: true,

            // double click delay duration
            preventDoubleSubmitTimeoutLength: 1000,

            // show validation-messages on failed submit
            setFormDirtyOnSubmit: true,

            // autofocus first error-element
            scrollToAndFocusFirstErrorOnSubmit: true,

            // set in ms
            scrollAnimationTime: 500,

            // fixed offset for scroll to element
            scrollOffset: -100,


            // The following options are not configurable via the
            // ngFabFormOptions-directive as they need to be
            // available during the $compile-phase

            // option to disable forms by wrapping them in a disabled <fieldset> element
            disabledForms: true,

            // add noovalidate to forms
            setNovalidate: true,

            // set form-element names based on ngModel if not set
            // NOTE: not changeable via ngFabFormOptions-directive as it needs to
            // available during the $compile-phase
            // NOTE2: name-attributes are required to be set here
            // or manually for the validations to work
            setNamesByNgModel: true,

            // add asterisk to required fields (requires jQuery)
            setAsteriskForRequiredLabel: false,

            // asterisk string to be added if enabled (requires jQuery) and
            // setAsteriskForRequiredLabel-option set to true
            asteriskStr: '*',

            // the validation message prefix, results for the default state
            // `validation-msg-required` or `validation-msg-your-custom-validation`
            validationMsgPrefix: 'validationMsg',

            // default email-regex, set to false to deactivate overwrite
            emailRegex: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************
        function addCustomValidations(html, attrs)
        {
            var container = angular.element(angular.element('<div/>').html(html));
            angular.forEach(attrs, function (attr, attrKey)
            {
                var regExp = new RegExp(config.validationMsgPrefix);
                if (attrKey.match(regExp)) {
                    var sanitizedKey = attrKey.replace(config.validationMsgPrefix, '');
                    sanitizedKey = sanitizedKey.charAt(0).toLowerCase() + sanitizedKey.slice(1);
                    var message = container[0].querySelector('[ng-message="' + sanitizedKey + '"]');
                    angular.element(message).text(attr);
                }
            });
            return container;
        }

        var insertErrorTpl = function (compiledAlert, el, attrs)
            {
                // insert after or after parent if checkbox or radio
                if (attrs.type === 'checkbox' || attrs.type === 'radio') {
                    el.parent().after(compiledAlert);
                } else {
                    el.after(compiledAlert);
                }
            },

            scrollTo = (function ()
            {
                // t: current time, b: begInnIng value, c: change In value, d: duration
                // see: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
                // and: http://upshots.org/actionscript/jsas-understanding-easing
                function easeInOutQuad(t, b, c, d)
                {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t + b;
                    }
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                }

                // longer scroll duration for longer distances
                function scaleTimeToDistance(distance, duration)
                {
                    var baseDistance = 500;
                    var distanceAbs = Math.abs(distance);
                    var min = duration / 10;
                    return duration * distanceAbs / baseDistance + min;
                }


                return function (targetEl, durationP, scrollOffset)
                {
                    function animateScroll()
                    {
                        currentTime += increment;
                        var val = easeInOutQuad(currentTime, start, change, duration);
                        window.scrollTo(targetX, val);

                        if (currentTime < duration) {
                            setTimeout(animateScroll, increment);
                        } else {
                            targetEl.focus();
                        }
                    }

                    var targetY = targetEl.getBoundingClientRect().top + parseInt(scrollOffset),
                        targetX = targetEl.getBoundingClientRect().left;
                    var duration = scaleTimeToDistance(targetY, durationP);

                    var start = window.pageYOffset,
                        change = targetY,
                        currentTime = 0,
                        increment = 20;

                    // return if no animation is required
                    if (change === 0) {
                        targetEl.focus();
                        return;
                    }

                    // init recursive function
                    animateScroll();
                };
            }());


        // *************************
        // PROVIDER-CONFIG-FUNCTIONS
        // *************************

        return {
            extendConfig: function (newConfig)
            {
                config = angular.extend(config, newConfig);
            },
            setInsertErrorTplFn: function (insertErrorTplFn)
            {
                insertErrorTpl = insertErrorTplFn;
            },
            setScrollToFn: function (scrollToFn)
            {
                scrollTo = scrollToFn;
            },


            // ************************************************
            // ACTUAL FACTORY FUNCTION - used by the directives
            // ************************************************

            $get: function ()
            {
                return {
                    insertErrorTpl: insertErrorTpl,
                    addCustomValidations: addCustomValidations,
                    scrollTo: scrollTo,
                    config: config
                };
            }
        };
    });
