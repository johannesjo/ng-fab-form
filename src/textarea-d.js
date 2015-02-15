angular.module('ngFabForm')
    .directive('textarea', function ($compile, ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    });
