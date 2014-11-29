angular.module('bsAutoForm')
    .factory('bsAutoFormDirective', function (bsAutoForm, $compile, $timeout)
    {
        'use strict';

        // factory definition
        var BsAutoFormDirective = {};

        // return factory
        return {
            restrict: 'E',
            require: ['^form', '^ngModel'],
            compile: function (el, attrs)
            {
                // if no ng-model is present just return
                if (!attrs.ngModel) {
                    return function ()
                    {
                    }
                }

                // set name attribute if none is set
                var newNameAttr = attrs.ngModel.replace('.', '_');
                el.attr('name', newNameAttr);
                attrs.name = newNameAttr;

                /**
                 * linking function
                 */
                return function (scope, el, attrs, controllers)
                {
                    var formCtrl = controllers[0],
                        ngModelCtrl = controllers[1];


                    // wait for validators to be ready
                    $timeout(function ()
                    {
                        var alertTpl = bsAutoForm.makeAlertTpl(formCtrl.$name, attrs, ngModelCtrl.$validators);
                        var compiledAlert = $compile(alertTpl)(scope);

                        bsAutoForm.insertErrorTpl(compiledAlert, el, attrs);
                    });
                };
            }
        };
    });
