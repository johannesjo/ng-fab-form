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

            // set either to fixed duration or to 'smooth'
            // 'smooth' means that the duration is calculated,
            // based on the distance to scroll (the more the faster it scrolls)
            scrollAnimationTime: 'smooth',

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
            validationMsgPrefix: 'validationMsg'
        };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************
        var insertErrorTpl = function (compiledAlert, el, attrs)
            {
                // insert after or after parent if checkbox or radio
                if (attrs.type === 'checkbox' || attrs.type === 'radio') {
                    el.parent().after(compiledAlert);
                } else {
                    el.after(compiledAlert);
                }
            },
            addCustomValidations = function (html, validators, attrs)
            {
                var container = angular.element('<div/>').html(html);
                angular.forEach(attrs, function (attr, attrKey)
                {
                    var regExp = new RegExp(config.validationMsgPrefix);
                    if (attrKey.match(regExp)) {
                        var sanitizedKey = attrKey.replace(config.validationMsgPrefix, '');
                        sanitizedKey = sanitizedKey.charAt(0).toLowerCase() + sanitizedKey.slice(1);
                        var message = container.find('[ng-message="' + sanitizedKey + '"]');
                        message.text(attr);
                    }
                });
                return container;
            };


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


            // ************************************************
            // ACTUAL FACTORY FUNCTION - used by the directives
            // ************************************************

            $get: function ()
            {
                return {
                    insertErrorTpl: insertErrorTpl,
                    addCustomValidations: addCustomValidations,
                    config: config
                };
            }
        };
    });
