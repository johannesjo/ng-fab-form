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
                validationMsgPrefix: 'validationMsg',


                // uses advanced dynamic validations,e .g. for min and max
                useAdvancedValidationMsgs: true,
                dateFormat: 'dd.MM.yy',
                timeFormat: 'HH:MM'
            },

            validationMessages = {
                // types
                email: 'This is not a valid email-address',
                password: 'This is not a valid password',
                date: 'This is not a valid date',
                time: 'This is not a valid time',
                datetime: 'This is no valid datetime',
                'datetime-local': 'This is no valid local datetime',
                number: 'This is no valid number',
                color: 'This no valid color',
                range: 'This is not a valid range',
                month: 'This is not a valid month',
                url: 'This is not a valid url',
                file: 'This not a valid file',

                // attributes
                required: 'This field is required',
                pattern: 'Your input does not match the requirements',
                size: 'This no valid size',

                // special validations (over written if
                // specialValidations is set to true
                max: 'Your input is too large',
                min: 'Your input is too short',
                maxlength: 'Your input is too long',
                minlength: 'Your input is too short'
            },

        // used to check for key value pairs in attributes if value is string
        // the function attributes are used to create the message
            advancedValidations = [
                // for all inputs
                {
                    maxlength: function (attrs)
                    {
                        return 'Your input should have max ' + attrs.maxlength + ' characters';
                    },
                    minlength: function (attrs)
                    {
                        return 'Your input should have at least ' + attrs.minlength + ' characters';
                    }
                },
                // date-fields
                {
                    type: 'time',
                    min: function (attrs)
                    {
                        return 'The time provided should be no earlier than {{"' + attrs.min + '"|date:"' + config.timeFormat + '"}}';
                    },
                    max: function (attrs)
                    {
                        return 'The time should be no later than {{"' + attrs.max + '"|date:"' + config.timeFormat + '"}}';
                    }
                },
                // date
                {
                    type: 'date',
                    min: function (attrs)
                    {
                        return 'The date provided should be no earlier than the {{"' + attrs.min + '"|date:"' + config.dateFormat + '"}}';
                    },
                    max: function (attrs)
                    {
                        return 'The date provided should be no later than the {{"' + attrs.max + '"|date:"' + config.dateFormat + '"}}';
                    }
                }
            ];


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

                // special handlers
                setMgsForSpecialValidationCombinations(attrs, customMsgs);

                // check for custom validation msgs added via validation-attribute
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
            },

            setMgsForSpecialValidationCombinations = function (attrs, customMsgs)
            {
                var applyRule,
                    msgFnKeys;

                var parseSpecialValidations = function (val, key)
                {
                    if (applyRule) {
                        if (angular.isFunction(val)) {
                            msgFnKeys.push(key);
                        } else {
                            applyRule = (attrs[key] && attrs[key] === val);
                        }
                    }
                };

                if (config.useAdvancedValidationMsgs) {
                    for (var i = 0; i < advancedValidations.length; i++) {
                        var validationObj = advancedValidations[i];
                        applyRule = true;
                        msgFnKeys = [];
                        angular.forEach(validationObj, parseSpecialValidations);
                        if (applyRule && msgFnKeys.length > 0) {
                            for (var j = 0; j < msgFnKeys.length; j++) {
                                var msgFnKey = msgFnKeys[j];
                                customMsgs[msgFnKey] = validationObj[msgFnKey](attrs);
                            }
                        }
                    }
                }
            };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************

        var makeAlertParams = function (formName, attrs, validators)
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
                return {
                    ngShowCondition: ngShowCondition,
                    formName: formName,
                    elName: elName,
                    messages: messages
                };
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


            // ************************************************
            // ACTUAL FACTORY FUNCTION - used by the directives
            // ************************************************

            $get: function ()
            {
                return {
                    insertErrorTpl: insertErrorTpl,
                    makeAlertParams: makeAlertParams,
                    makeWrapperTpl: makeAlertWrapperTpl,
                    config: config,
                    validationMessages: validationMessages,
                    advancedValidations: advancedValidations
                };
            }
        };
    });
