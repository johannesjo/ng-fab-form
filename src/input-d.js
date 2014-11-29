angular.module('bsAutoForm')
    .directive('input', function ($compile, bsAutoForm, $timeout)
    {
        'use strict';

        return {
            restrict: 'E',
            require: ['^form', '^ngModel'],
            compile: function (el, attrs)
            {
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


                    var alertTpl = bsAutoForm.makeAlertTpl(formCtrl.$name, attrs, ngModelCtrl.$validators);
                    var compiledAlert = $compile(alertTpl)(scope);

                    // check if validation should only be triggered on blur
                    //if (bsAutoForm.config.triggerOnBlur) {
                    //    el.bind('blur.bsAutoForm', function ()
                    //    {
                    //        el.unbind('blur.bsAutoForm');
                    //        scope.$apply(function ()
                    //        {
                    //            bsAutoForm.insertErrorTpl(compiledAlert, el, attrs);
                    //            ngModelCtrl.$setTouched();
                    //            ngModelCtrl.$setViewValue('QUATSCH');
                    //        });
                    //            //ngModelCtrl.$setDirty();
                    //            //ngModelCtrl.$commitViewValue();
                    //    });
                    //} else {
                        bsAutoForm.insertErrorTpl(compiledAlert, el, attrs);
                    //}
                };
            }
        };
    });
