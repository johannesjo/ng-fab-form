angular.module('ngFabForm')
    .directive('ngFabMatch', function match()
    {
        'use strict';

        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                ngFabMatch: '='
            },
            link: function (scope, el, attrs, ngModel)
            {
                ngModel.$validators.ngFabMatch = function (modelValue)
                {
                    return Boolean(modelValue) && modelValue == scope.ngFabMatch;
                };
                scope.$watch('ngFabMatch', function ()
                {
                    ngModel.$validate();
                });
            }
        };
    });
