angular.module('bsAutoForm')
    .directive('form', function ($compile)
    {
        'use strict';

        return {
            restrict: 'E',
            scope: false,
            require: 'form',
            link: function (scope, el, attrs, formModel)
            {
                var formPrefix = formModel.$name;

                if (!attrs.name) {
                    throw 'bsAutoForm: each form needs a name';
                }

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
