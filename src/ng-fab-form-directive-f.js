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
                    var tpl = ngFabForm.config.template;
                    if (formCtrl && ngModelCtrl && tpl) {
                        // load validation directive template
                        $templateRequest(tpl)
                            .then(function processTemplate(html)
                            {
                                var privateScope = $rootScope.$new(true);
                                //privateScope.params = alertParams;
                                privateScope.attrs = attrs;
                                privateScope.field = scope[formCtrl.$name][ngModelCtrl.$name];
                                privateScope.error = scope[formCtrl.$name][ngModelCtrl.$name].$error;
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
                }
                    ;
            }
        };
    });
