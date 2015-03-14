angular.module('ngFabForm')
    .directive('select', ['ngFabFormValidationsDirective', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    }]);
