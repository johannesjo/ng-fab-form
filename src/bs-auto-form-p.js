angular.module('bsAutoForm')
    .provider('bsAutoForm', function bsAutoFormProvider()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
                showErrorsOn: [
                    '$touched',
                    '$dirty'
                ],
                preventInvalidSubmit: true,
                preventDoubleSubmit: true,
                preventDoubleSubmitTimeoutLength: 1000,
                setFormDirtyOnSubmit: true,
                disabledForms: true,
                eventNameSpace: 'bsAutoForm'
            },

            validationMessages = {
                required: 'This field is required',
                pattern: 'Your input does not match the requirements',
                maxlength: 'Your input is too long',
                minlength: 'Your input is too short',
                email: 'This is not a valid email-address'
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
                    if (attrKey.match(/validateMsg/)) {
                        var sanitizedKey = attrKey.replace('validateMsg', '');
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
