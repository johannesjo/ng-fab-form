angular.module('jurato.ngFabForm')
    .directive('input', function ()
    {
        'use strict';
        var makeAlertTemplate = function (closeScopeName, msg)
        {
            return '<div class="alert alert-warning"' +
                'ng-show="!' + closeScopeName + '"' +
                '>' +
                msg +
                '</div>';
        };
        
        return {
            restrict: 'E',
            link: function (scope, el, attrs, model)
            {

            }
        };
    });
