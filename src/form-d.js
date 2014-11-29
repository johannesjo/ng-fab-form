angular.module('bsAutoForm')
    .directive('form', function ($compile, $timeout, bsAutoForm)
    {
        'use strict';
        // HELPER FUNCTIONS
        var preventFormSubmit = function (ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
        };

        var setupPreventDoubleSubmit = function (scope, el, formSubmitDisabledTimeoutLength, nameSpace)
            {
                var formSubmitDisabledTimeout,
                    formSubmitDisabled = false;

                var enableFormSubmit = function ()
                    {
                        formSubmitDisabled = false;
                    },
                    disableFormSubmit = function ()
                    {
                        formSubmitDisabled = true;

                        // cancel timeout if set before
                        if (formSubmitDisabledTimeout) {
                            $timeout.cancel(formSubmitDisabledTimeout);
                        }
                        formSubmitDisabledTimeout = $timeout(enableFormSubmit, formSubmitDisabledTimeoutLength);
                    };

                // don't forget to cancel set timeouts
                scope.$on('$destroy', function ()
                {
                    if (formSubmitDisabledTimeout) {
                        $timeout.cancel(formSubmitDisabledTimeout);
                    }
                });


                // bind submit listener first to prevent submission
                el.bindFirst('submit.' + nameSpace, function (ev)
                {
                    console.log('setupPreventDoubleSubmit', formSubmitDisabled);

                    // prevent double submission
                    if (formSubmitDisabled) {
                        preventFormSubmit(ev);
                        disableFormSubmit();
                    } else {
                        formSubmitDisabled = true;
                        disableFormSubmit();
                    }
                });
            },
            setupPreventInvalidSubmit = function (scope, el, formCtrl, eventNameSpace)
            {

                var formSubmitDisabled = false;

                // bind submit listener first to prevent submission
                el.bindFirst('submit.' + eventNameSpace, function (ev)
                {
                    console.log('setupPreventInvalidSubmit', formSubmitDisabled);

                    if (formSubmitDisabled) {
                        preventFormSubmit(ev);
                    }
                });

                // watch validity of the form
                scope.$watch(function ()
                {
                    return formCtrl.$valid;
                }, function (valid)
                {
                    console.log(valid);

                    formSubmitDisabled = !valid;
                });
            },

            setupDisabledForms = function (el, attrs)
            {
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
            },


            setupDirtyOnSubmit = function (scope)
            {

                angular.forEach(scope, function (value)
                {
                    // We skip non-form and non-inputs
                    if (!value || value.$dirty === undefined) {
                        return;
                    }
                    // Recursively applying same method on all forms included in the form
                    //if (value.$addControl) {
                    //    return setAllInputsDirty(value);
                    //}
                    // Setting inputs to $dirty, but re-applying its content in itself
                    if (value.$setViewValue) {
                        return value.$setViewValue(value.$viewValue);
                    }
                });
            };


        return {
            restrict: 'E',
            scope: false,
            require: 'form',
            link: function (scope, el, attrs, formCtrl)
            {
                var formSubmitDisabledTimeoutLength = bsAutoForm.config.preventDoubleSubmitTimeoutLength,
                    eventNameSpace = bsAutoForm.config.eventNameSpace;

                if (bsAutoForm.config.preventInvalidSubmit) {
                    setupPreventInvalidSubmit(scope, el, formCtrl, eventNameSpace);
                }
                if (bsAutoForm.config.preventDoubleSubmit) {
                    setupPreventDoubleSubmit(scope, el, formSubmitDisabledTimeoutLength, eventNameSpace);
                }
                if (bsAutoForm.config.disabledForms) {
                    setupDisabledForms(el, attrs);
                }
                if (bsAutoForm.config.setFormDirtyOnSubmit) {
                    setupDirtyOnSubmit(scope);
                }


            }
        };
    });
