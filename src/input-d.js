angular.module('bsAutoForm')
    .directive('input', function ($compile, bsAutoForm)
    {
        'use strict';

        return {
            restrict: 'E',
            require: ['^form', '^ngModel'],
            compile: function (el, attrs)
            {
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

                    var newScopeVarName = formCtrl.$name + '_' + attrs.name + '_errors';
                    var alertTpl = bsAutoForm.makeAlertTpl(formCtrl.$name, attrs.name, ngModelCtrl.$validators);
                    var compiledAlert = $compile(alertTpl)(scope);

                    console.log(ngModelCtrl);

                    //scope.$watch(function ()
                    //{
                    //    return ngModelCtrl.$modelValue;
                    //}, function ()
                    //{
                    //    console.log(ngModelCtrl.$error, scope[formCtrl.$name][attrs.name].$error);
                    //
                    //    // set errors
                    //    scope[newScopeVarName] = bsAutoForm.getErrorMsgs(ngModelCtrl.$error);
                    //}, true);


                    // insert after or after parent if checkbox or radio
                    bsAutoForm.insertErrorTpl(compiledAlert, el, attrs);


                };
            }
        };
    });
