angular.module('bsAutoForm')
    .provider('bsAutoForm', function bsAutoFormProvider ()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
                triggerOnBlur: true
            },


        // TODO find a solution for patterns
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
                return '<div ng-if="' + ngShowCondition + '"' +
                    'ng-messages="' + formName + '.' + elName + '.$error" ' +
                    'class="help-block with-errors">' +
                    '<ul class ="list-unstyled">' +
                    messages +
                    '</ul></div>';
            },


            makeMsgsTpl = function (validators, attrs)
            {
                var messages = '',
                    customValidationMsgs = {};

                // check for custom validation msgs
                angular.forEach(attrs, function (attr, attrKey)
                {
                    if (attrKey.match(/validateMsg/)) {
                        var sanitizedKey = attrKey.replace('validateMsg', '');
                        sanitizedKey = sanitizedKey.charAt(0).toLowerCase() + sanitizedKey.slice(1);
                        customValidationMsgs[sanitizedKey] = attr;
                    }
                });
                console.log(customValidationMsgs);


                angular.forEach(validators, function (validator, validatorKey)
                {
                    if (customValidationMsgs && customValidationMsgs[validatorKey]) {
                        messages += '<li ng-message="' + validatorKey + '">' + customValidationMsgs[validatorKey] + '</li>';
                    } else {
                        messages += '<li ng-message="' + validatorKey + '">' + validationMessages[validatorKey] + '</li>';
                    }
                });
                return messages;
            };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************

        var makeAlertTpl = function (formName, attrs, validators)
            {
                var elName = attrs.name;
                // show when invalid and touched or dirty
                var ngShowCondition = formName + '.' + elName + '.$invalid' +
                    ' && (' + formName + '.' + elName + '.$touched' +
                    ' || ' + formName + '.' + elName + '.$dirty)';


                var messages = makeMsgsTpl(validators, attrs);
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
