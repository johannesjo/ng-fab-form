angular.module('ngFabForm')
    .directive('textarea', ['ngFabFormValidationsDirective', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    }]);
