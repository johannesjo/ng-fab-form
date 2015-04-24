angular.module('ngFabForm')
    .directive('ngFabEnsureExpression', ['$http', '$parse', function ($http, $parse)
    {
        'use strict';

        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, ngModelController)
            {
                scope.$watch(attrs.ngModel, function ()
                {
                    var booleanResult = $parse(attrs.ngFabEnsureExpression)(scope);
                    ngModelController.$setValidity('ngFabEnsureExpression', booleanResult);
                    ngModelController.$validate();
                });
            }
        };
    }]);
