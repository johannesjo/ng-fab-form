angular.module('ngFabForm')
    .directive('form', function ($compile, $timeout, ngFabForm)
    {
        'use strict';
        // HELPER FUNCTIONS
        var preventFormSubmit = function (ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
        };

        var setupPreventDoubleSubmit = function (scope, el, formSubmitDisabledTimeoutLength, eventNameSpace)
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
                el.bindFirst('submit.' + eventNameSpace, function (ev)
                {
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


            setupDirtyOnSubmit = function (scope, el, eventNameSpace, formCtrl)
            {
                // bind submit listener first to prevent submission
                el.bindFirst('submit.' + eventNameSpace, function ()
                {
                    scope.$apply(function ()
                    {
                        formCtrl.$triedSubmit = true;
                    });
                });
            },


            setupScrollToAndFocusFirstErrorOnSubmit = function (el, formCtrl, eventNameSpace, scrollAnimationTime, scrollOffset)
            {
                var scrollActualAnimationTime = scrollAnimationTime;
                el.bindFirst('submit.' + eventNameSpace, function ()
                {
                    var scrollTargetEl = el.find('.ng-invalid').first();
                    scrollTargetEl.addClass('is-scroll-target');
                    if (scrollTargetEl && formCtrl.$invalid) {
                        var scrollTop = $(scrollTargetEl).offset().top + scrollOffset;
                        if (scrollAnimationTime) {
                            if (scrollAnimationTime === 'smooth') {
                                scrollActualAnimationTime = (Math.abs(window.scrollY - scrollTop)) / 4 + 200;
                            }
                            $('html, body').animate({
                                scrollTop: scrollTop
                            }, scrollActualAnimationTime, function ()
                            {
                                scrollTargetEl.focus();
                                scrollTargetEl.removeClass('is-scroll-target');
                            });
                        } else {
                            window.scrollTo(0, scrollTop);
                        }
                    }
                });
            };


        return {
            restrict: 'E',
            scope: false,
            require: 'form',
            compile: function (el, attrs)
            {
                // autoset novalidate
                if (!attrs.novalidate && ngFabForm.config.setNovalidate) {
                    // set name attribute if none is set
                    el.attr('novalidate', true);
                    attrs.novalidate = true;
                }

                /**
                 * linking function
                 */
                return function (scope, el, attrs, formCtrl)
                {
                    var formSubmitDisabledTimeoutLength = ngFabForm.config.preventDoubleSubmitTimeoutLength,
                        eventNameSpace = ngFabForm.config.eventNameSpace;

                    /**
                     * NOTE: order is important
                     * all submit-handlers are attached via bind first,
                     * so the last attached handler comes first
                     */

                    if (ngFabForm.config.preventInvalidSubmit) {
                        setupPreventInvalidSubmit(scope, el, formCtrl, eventNameSpace);
                    }
                    if (ngFabForm.config.preventDoubleSubmit) {
                        setupPreventDoubleSubmit(scope, el, formSubmitDisabledTimeoutLength, eventNameSpace);
                    }
                    if (ngFabForm.config.disabledForms) {
                        setupDisabledForms(el, attrs);
                    }
                    if (ngFabForm.config.setFormDirtyOnSubmit) {
                        setupDirtyOnSubmit(scope, el, eventNameSpace, formCtrl);
                    }
                    if (ngFabForm.config.scrollToAndFocusFirstErrorOnSubmit) {
                        setupScrollToAndFocusFirstErrorOnSubmit(el, formCtrl, eventNameSpace, ngFabForm.config.scrollAnimationTime, ngFabForm.config.scrollOffset);
                    }

                };
            }
        };
    });
