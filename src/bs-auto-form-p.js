angular.module('bsAutoForm')
    .provider('bsAutoForm', function ()
    {
        'use strict';

        var validationAttrs = [
            // ng model
            'ngPattern',
            'pattern',
            'ngRequired',
            'required',
            'minlength',
            'maxlength',
            'size'
        ];


        // DEFAULTS
        var validationErrorClass = 'alert-danger',
            validationMessages = {
                required: 'Dieses Feld wird benötigt',
                pattern: 'Eingabe entspricht nicht den Anforderungen'

            },
            makeAlertTpl = function (formName, elName, errorsScopeString)
            {
                var ngShowCondition = formName + '.' + elName + '.$invalid' +
                    ' && ' + formName + '.' + elName + '.$dirty';

                return '<div class="alert ' + validationErrorClass + '"' +
                    'ng-show="' + ngShowCondition + '"' +
                    'ng-bind-html-unsafe="' + errorsScopeString + '">' +
                    '{{' + errorsScopeString + '}}' +
                    '</div>';
            },
            insertErrorTpl = function (compiledAlert, el, attrs)
            {
                if (attrs.type === 'checkbox' || attrs.type === 'radio') {
                    el.parent().after(compiledAlert);
                } else {
                    el.after(compiledAlert);
                }
            };

        // PROVIDER-CONFIG-FUNCTIONS
        return {
            extendValidationMessages: function (newValidationMessages)
            {
                validationMessages = angular.extend(validationMessages, newValidationMessages);
            },
            setValidationErrorClass: function (newValidationClass)
            {
                validationErrorClass = newValidationClass;
            },
            setTplFunction: function (tplFunction)
            {
                makeAlertTpl = tplFunction;
            },
            setInsertErrorTplFn: function (insertErrorTplFn)
            {
                insertErrorTpl = insertErrorTplFn;
            },

            // ACTUAL FACTORY FUNCTION
            $get: function ()
            {


                return {
                    insertErrorTpl: insertErrorTpl,
                    makeAlertTpl: makeAlertTpl,
                    getErrorMsgs: function (errors)
                    {
                        var msgs = '';
                        angular.forEach(errors, function (error, errorKey)
                        {
                            msgs += '<p>' + validationMessages[errorKey] + '</p>';
                        });
                        console.log(msgs);

                        return msgs;
                    }
                };
            }
        };
    });
