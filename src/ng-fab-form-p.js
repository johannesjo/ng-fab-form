angular.module('ngFabForm')
    .provider('ngFabForm', function ngFabFormProvider()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
                showErrorsOn: [
                    '$touched', // if element was focussed
                    '$dirty' // if element was edited
                ],
                // add noovalidate to forms
                setNovalidate: true,

                // add asterisk to required fields
                setAsteriskForRequiredLabel: false,

                // asterisk string to be added if enabled
                asteriskStr: '*',

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

                // event-name-space, usually you won't need to change anything here
                eventNameSpace: 'ngFabForm',

                // the validation message prefix, results for the default state
                // `validation-msg-required` or `validation-msg-your-custom-validation`
                validationMsgPrefix: 'validationMsg'
            },

            validationMessages = {
                // types
                email: 'This is not a valid email-address',
                password: 'This is not a valid password',
                date: 'This is no valid date',
                time: 'This is no valid time',
                datetime: 'This is no valid datetime',
                'datetime-local': 'This is no valid local datetime',
                number: 'This is no valid number',
                color: 'This no valid color',
                range: 'This is no valid range',
                month: 'This is no valid month',
                url: 'This is no valid url',
                file: 'This no valid file',

                // attributes
                required: 'This field is required',
                pattern: 'Your input does not match the requirements',
                maxlength: 'Your input is too long',
                minlength: 'Your input is too short',
                max: 'Your input is too large',
                min: 'Your input is too short',
                size: 'This no valid size'
            };


        // *****************
        // HELPER FUNCTIONS
        // ****************

        var makeAlertWrapperTpl = function (ngShowCondition, formName, elName, messages)
            {
                var msgs = '';
                angular.forEach(messages, function (msg, key)
                {
                    msgs += '<li ng-message="' + key + '">' + msg + '</li>';
                });

                return '<div ng-show="' + ngShowCondition + '"' +
                    'ng-messages="' + formName + '.' + elName + '.$error" ' +
                    'class="help-block with-errors">' +
                    '<ul class ="list-unstyled">' +
                    msgs +
                    '</ul></div>';
            },


            makeMsgs = function (validators, attrs)
            {
                var allMgs = {},
                    customMsgs = {};

                // check for custom validation msgs
                angular.forEach(attrs, function (attr, attrKey)
                {
                    var regExp = new RegExp(config.validationMsgPrefix);
                    if (attrKey.match(regExp)) {
                        var sanitizedKey = attrKey.replace(config.validationMsgPrefix, '');
                        sanitizedKey = sanitizedKey.charAt(0).toLowerCase() + sanitizedKey.slice(1);
                        customMsgs[sanitizedKey] = attr;
                    }
                });

                angular.forEach(validators, function (validator, validatorKey)
                {
                    if (customMsgs && customMsgs[validatorKey]) {
                        allMgs[validatorKey] = customMsgs[validatorKey];
                    } else {
                        allMgs[validatorKey] = validationMessages[validatorKey];
                    }
                });

                return allMgs;
            };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************

        var makeAlertTpl = function (formName, attrs, validators)
            {
                var elName = attrs.name;

                var ngShowCondition = formName + '.' + elName + '.$invalid';
                ngShowCondition += ' && (';
                angular.forEach(config.showErrorsOn, function (state, index)
                {
                    if (index === 0) {
                        ngShowCondition += formName + '.' + elName + '.' + state;
                    } else {
                        ngShowCondition += ' || ' + formName + '.' + elName + '.' + state;
                    }
                });
                ngShowCondition += '|| ' + formName + '.$triedSubmit';
                ngShowCondition += ')';


                var messages = makeMsgs(validators, attrs);
                return makeAlertWrapperTpl(ngShowCondition, formName, elName, messages);
            },


            insertErrorTpl = function (compiledAlert, el, attrs)
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
            extendValidationMessages: function (newValidationMessages)
            {
                validationMessages = angular.extend(validationMessages, newValidationMessages);
            },
            extendConfig: function (newConfig)
            {
                config = angular.extend(config, newConfig);
            },
            setWrapperTplFunction: function (tplFunction)
            {
                makeAlertWrapperTpl = tplFunction;
            },
            setInsertErrorTplFn: function (insertErrorTplFn)
            {
                insertErrorTpl = insertErrorTplFn;
            },


            // ************************
            // ACTUAL FACTORY FUNCTION
            // ***********************

            $get: function ()
            {
                return {
                    insertErrorTpl: insertErrorTpl,
                    makeAlertTpl: makeAlertTpl,
                    config: config
                };
            }
        };
    });
