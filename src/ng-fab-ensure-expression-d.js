angular.module('ngFabForm')
    .directive('ngFabEnsureExpression', ['$http', '$parse', function ($http, $parse) {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, ngModelController) {
                scope.$watch(attrs.ngModel, function (value) {
                    var booleanResult = $parse(attrs.ngFabEnsureExpression)(scope);
                    ngModelController.$setValidity('ngFabEnsureExpression', booleanResult);
                });
            }
        };
}]);