angular.module('ngFabForm')
    .directive('form', function ($compile, FormErrorMsgs)
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
            scope: false,
            require: 'form',
            link: function (scope, el, attrs, formModel)
            {
                var formPrefix = formModel.$name;

                if (!attrs.name) {
                    throw 'ngFabForm: each form needs a name';
                }

                //angular.forEach(el.find('input'), function (inputEl)
                //{
                //    inputEl = $(inputEl);
                //    var required = inputEl.attr('required');
                //    var inpName = inputEl.attr('name');
                //    console.log(inputEl);
                //
                //    if (required && !inpName) {
                //        throw 'NO NAME GIVEN';
                //    }
                    //var closeScopeName = formPrefix + '.' + inpName + '.$error';
                    //
                    //var alert = makeAlertTemplate(closeScopeName, 'msg');
                    //$(inputEl).parent().append($compile(alert)(scope));

                //});


                el.find('textarea');


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
            }
        };
    });
