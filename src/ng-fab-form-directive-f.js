angular.module('ngFabForm')
    .factory('ngFabFormDirective', function (ngFabForm, $compile, $timeout, $templateRequest, $rootScope)
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
                        //$timeout(function ()
                        //{
                        //    var alertParams = ngFabForm.makeAlertParams(formCtrl.$name, attrs, ngModelCtrl.$validators);
                        //
                        //});

                        $templateRequest('test.html')
                            .then(function processTemplate(html)
                            {
                                var privateScope = $rootScope.$new(true);
                                //privateScope.params = alertParams;
                                privateScope.attrs = attrs;
                                privateScope.field = scope[formCtrl.$name][ngModelCtrl.$name];
                                privateScope.error =  scope[formCtrl.$name][ngModelCtrl.$name].$error;
                                privateScope.p = scope;
                                var compiledAlert = $compile(html)(privateScope);
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
                }
                    ;
            }
        };
    });
