angular.module('ngFabForm')
    .directive('ngFabResetFormOn', function match()
    {
        'use strict';

        return {
            require: '^form',
            restrict: 'A',
            scope: {
                ngFabResetFormOn: '@',
                doNotClearInputs: '@'
            },
            link: function (scope, el, attrs, formCtrl)
            {
                if (!attrs.ngFabResetFormOn) {
                    attrs.ngFabResetFormOn = 'click';
                }

                el.on(attrs.ngFabResetFormOn, function ()
                {
                    if (attrs.doNotClearInputs) {
                        formCtrl.$resetForm();
                    } else {
                        formCtrl.$resetForm(true);
                    }

                    scope.$apply();
                });
            }
        };
    });
