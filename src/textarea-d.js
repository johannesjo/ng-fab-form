angular.module('bsAutoForm')
    .directive('textarea', function ($compile, bsAutoFormDirective)
    {
        'use strict';

        console.log(bsAutoFormDirective);

        return bsAutoFormDirective;
    });
