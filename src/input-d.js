angular.module('ngFabForm')
    .directive('input', ['ngFabFormValidationsDirective', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    }]);
