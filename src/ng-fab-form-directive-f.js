angular.module('ngFabForm')
    .factory('ngFabFormDirective', function (ngFabForm, $compile, $templateRequest, $rootScope)
    {
        'use strict';

        // return factory
        return {
            restrict: 'E',
            require: ['?^form', '?ngModel'],
            compile: function (el, attrs)
            {
                // only execute if ng-model is present and
                // no name attr is set already
                if (ngFabForm.config.setNamesByNgModel && attrs.ngModel && !attrs.name) {
                    // set name attribute if none is set
                    var newNameAttr = attrs.ngModel.replace(/\./g, '_');
                    el.attr('name', newNameAttr);
                    attrs.name = newNameAttr;
                }

                /**
                 * linking function
                 */
                return function (scope, el, attrs, controllers)
                {
                    var formCtrl = controllers[0],
                        ngModelCtrl = controllers[1],
                        validationsTpl = ngFabForm.config.validationsTemplate;

                    // apply validation messages
                    // only if required controllers and validators are set
                    if (ngFabForm.config.showValidationMsgs && formCtrl && ngModelCtrl && validationsTpl && (Object.keys(ngModelCtrl.$validators).length !== 0)) {

                        // load validation directive template
                        $templateRequest(validationsTpl)
                            .then(function processTemplate(html)
                            {
                                // add custom (attr) validations
                                html = ngFabForm.addCustomValidations(html, ngModelCtrl.$validators, attrs);

                                // create new scope for validation messages
                                var privateScope = $rootScope.$new(true);
                                privateScope.attrs = attrs;
                                privateScope.form = scope[formCtrl.$name];
                                privateScope.field = scope[formCtrl.$name][ngModelCtrl.$name];

                                // compile and insert messages
                                var compiledAlert = $compile(html)(privateScope);
                                ngFabForm.insertErrorTpl(compiledAlert, el, attrs);
                            });
                    }


                    // set asterisk for labels
                    if (ngFabForm.config.setAsteriskForRequiredLabel && attrs.required === true) {
                        var label = $('label[for=' + attrs.name + ']');
                        if (label.length < 1) {
                            label = el.prev('label');
                        }
                        if (label && label[0]) {
                            if (attrs.type !== 'radio' && attrs.type !== 'checkbox') {
                                label[0].innerText = label[0].innerText + ngFabForm.config.asteriskStr;
                            }
                        }
                    }
                };
            }
        };
    });
