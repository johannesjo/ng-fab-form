angular.module('ngFabForm')
    .directive('input', function ($compile)
    {
        'use strict';
        var makeAlertTpl = function (closeCondition, msg)
        {
            console.log(closeCondition);

            return '<div class="alert alert-warning"' +
                'ng-show="' + closeCondition + '"' +
                '>' +
                msg +
                '</div>';
        };

        return {
            restrict: 'E',
            require: ['^form', '^ngModel'],
            compile: function (el, attrs)
            {
                var newNameAttr = attrs.ngModel.replace('.', '_');

                el.attr('name', newNameAttr);
                attrs.name = newNameAttr;

                // linking function
                return function (scope, el, attrs, controllers)
                {
                    var formCtrl = controllers[0],
                        ngModelCtrl = controllers[1],
                        alertTpl;

                    var alertCondition = formCtrl.$name + '.' + attrs.name + '.$invalid';
                    alertCondition += ' && ' + formCtrl.$name + '.' + attrs.name + '.$dirty';

                    var msg = alertCondition;

                    alertTpl = makeAlertTpl(alertCondition, msg);


                    if (attrs.type === 'checkbox' || attrs.type === 'radio') {
                        el.parent().after($compile(alertTpl)(scope));
                    } else {
                        el.after($compile(alertTpl)(scope));
                    }
                };
            }
        };
    });
