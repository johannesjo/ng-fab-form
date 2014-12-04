angular.module('ngFabForm')
    .provider('ngFabForm', function ngFabFormProvider()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
            // template-url/templateId
            // to disable validation alltogether set it false
            template: 'ng-fab-form-default-validation.tpl.html',

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

            // fixed offset for scroll to elment
            scrollOffset: -100,

            // option to disable forms by wrapping them in a disabled <fieldset> elment
            disabledForms: true,

            // add noovalidate to forms
            setNovalidate: true,

            // add asterisk to required fields
            setAsteriskForRequiredLabel: false,

            // asterisk string to be added if enabled
            asteriskStr: '*',

            // event-name-space, usually you won't need to change anything here
            eventNameSpace: 'ngFabForm',

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
                    config: config,
                };
            }
        };
    });
