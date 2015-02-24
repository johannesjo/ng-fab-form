angular.module('ngFabForm')
    .directive('match', function match()
    {
        'use strict';

        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                match: '='
            },
            link: function (scope, el, attrs, ngModel)
            {
                ngModel.$validators.match = function (modelValue)
                {
                    return Boolean(modelValue) && modelValue == scope.match;
                };
                scope.$watch('match', function ()
                {
                    ngModel.$validate();
                });
            }
        };
    });
