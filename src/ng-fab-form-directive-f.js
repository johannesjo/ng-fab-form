angular.module('ngFabForm')
    .factory('ngFabFormDirective', function (ngFabForm, $compile, $timeout)
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
                if (attrs.ngModel && !attrs.name) {
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
                        ngModelCtrl = controllers[1];

                    // only execute if there is a form and model controller
                    if (formCtrl && ngModelCtrl) {
                        // wait for validators to be ready
                        $timeout(function ()
                        {
                            var alertTpl = ngFabForm.makeAlertTpl(formCtrl.$name, attrs, ngModelCtrl.$validators);
                            var compiledAlert = $compile(alertTpl)(scope);

                            ngFabForm.insertErrorTpl(compiledAlert, el, attrs);
                        });
                    }

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
