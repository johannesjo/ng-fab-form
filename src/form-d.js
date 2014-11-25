angular.module('ngFabForm')
    .directive('form', function ($compile, $timeout, $parse)
    {
        'use strict';

        var disableFormTimeoutLength = 1000,
            showAlertSuffix = '_showAlert',
            closeAlertSuffix = '_close',
            makeAlertTemplate = function (formPrefix)
            {
                return '<div class="alert alert-warning"' +
                    'ng-show="' + formPrefix + showAlertSuffix + '"' +
                    '>' +
                    '<button type="button" class="close"' +
                    'ng-click="' + formPrefix + closeAlertSuffix + '()"' +
                    '>' +
                    '<span aria-hidden="true">×</span>' +
                    '<span class="sr-only">Close</span>' +
                    '</button>' +
                    'Bitte füllen sie das Formular aus' +
                    '</div>';
            };

        return {
            restrict: 'E',
            scope: false,
            require: 'form',
            link: function (scope, el, attrs, formModel)
            {
                var enableForm = function ()
                {
                    button.removeAttr('disabled');
                    disableForm = false;
                };
                var preventFormSubmission = function (ev)
                {
                    ev.preventDefault();
                    ev.stopPropagation();
                    ev.stopImmediatePropagation();
                };
                var setOrResetFormEnableTimeout = function ()
                {
                    if (disableFormTimeout) {
                        $timeout.cancel(disableFormTimeout);
                    }
                    disableFormTimeout = $timeout(enableForm, disableFormTimeoutLength);
                };
//scope.disabled=


                var formPrefix = formModel.$name;
                var showAlertKey = formPrefix + showAlertSuffix,
                    disableFormTimeout,
                    disableForm = false,
                    closeAlertKey = formPrefix + closeAlertSuffix,
                    alert = makeAlertTemplate(formPrefix),
                    button = el.find('button[type=submit]');

                // append alert to form
                el.append($compile(alert)(scope));

                // third party jquery plugin to make this
                // function execute before ng-submit by
                // moving it up the event order
                el.bindFirst('submit', function (ev)
                {
                    // prevent double submission
                    if (disableForm) {
                        preventFormSubmission(ev);
                        setOrResetFormEnableTimeout();
                    } else if (formModel.$valid) {
                        // prevent double submission
                        disableForm = true;
                        button.attr('disabled', true);
                        setOrResetFormEnableTimeout();
                    } else {
                        // prevent submission, if invalid and show alert
                        scope.$apply(function ()
                        {
                            formModel.$triedSubmit = true;
                            scope[showAlertKey] = true;
                        });
                        preventFormSubmission(ev);
                    }
                });

                scope[closeAlertKey] = function ()
                {
                    scope[showAlertKey] = false;
                };

                // watch validity of the form
                scope.$watch(function ()
                {
                    return formModel.$valid;
                }, function ()
                {
                    formModel.$triedSubmit = false;
                    scope[showAlertKey] = false;
                });

                // watch disabled form if set (requires jQuery)
                if (attrs.disableForm) {
                    el.wrapInner('<fieldset>');
                    var fieldSetWrapper = el.children();
                    attrs.$observe('disableForm', function ()
                    {
                        // NOTE attrs get parsed as string
                        if (attrs.disableForm === 'true' || attrs.disableForm === true) {
                            fieldSetWrapper.attr('disabled', true);
                        } else {
                            fieldSetWrapper.removeAttr('disabled');
                        }
                    });
                }


                // don't forget to cancel set timeouts
                scope.$on('$destroy', function ()
                {
                    if (disableFormTimeout) {
                        $timeout.cancel(disableFormTimeout);
                    }
                });
            }
        };
    });
