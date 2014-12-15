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

        var setupDisabledForms = function (el, attrs)
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


            scrollToAndFocusFirstErrorOnSubmit = function (el, formCtrl, scrollAnimationTime, scrollOffset)
            {
                if (!window.$) {
                    throw 'scroll-to requires jQuery to be installed';
                } else {
                    var scrollActualAnimationTime = scrollAnimationTime;

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
                }
            };


        return {
            restrict: 'E',
            scope: false,
            require: 'form',
            compile: function (el, attrs)
            {
                var formCtrlInCompile,
                    scopeInCompile,
                    formSubmitDisabledTimeout,
                    formSubmitDisabledTimeoutLength = ngFabForm.config.preventDoubleSubmitTimeoutLength;


                // autoset novalidate
                if (!attrs.novalidate && ngFabForm.config.setNovalidate) {
                    // set name attribute if none is set
                    el.attr('novalidate', true);
                    attrs.novalidate = true;
                }


                // SUBMISSION HANDLING
                el.bind('submit', function (ev)
                {
                    // set dirty if option is set
                    if (ngFabForm.config.setFormDirtyOnSubmit) {
                        scopeInCompile.$apply(function ()
                        {
                            formCtrlInCompile.$triedSubmit = true;
                        });
                    }

                    // prevent submit for invalid if option is set
                    if (ngFabForm.config.preventInvalidSubmit && !formCtrlInCompile.$valid) {
                        preventFormSubmit(ev);
                    }

                    // prevent double submission if option is set
                    else if (ngFabForm.config.preventDoubleSubmit) {
                        if (formCtrlInCompile.$preventDoubleSubmit) {
                            preventFormSubmit(ev);
                        }

                        // cancel timeout if set before
                        if (formSubmitDisabledTimeout) {
                            $timeout.cancel(formSubmitDisabledTimeout);
                        }

                        formCtrlInCompile.$preventDoubleSubmit = true;
                        formSubmitDisabledTimeout = $timeout(function ()
                        {
                            formCtrlInCompile.$preventDoubleSubmit = false;
                        }, formSubmitDisabledTimeoutLength);
                    }

                    if (ngFabForm.config.scrollToAndFocusFirstErrorOnSubmit) {
                        scrollToAndFocusFirstErrorOnSubmit(el, formCtrlInCompile, ngFabForm.config.scrollAnimationTime, ngFabForm.config.scrollOffset);
                    }
                });
                // /SUBMISSION HANDLING


                /**
                 * linking function
                 */
                return function (scope, el, attrs, formCtrl)
                {
                    formCtrlInCompile = formCtrl;
                    scopeInCompile = scope;

                    /**
                     * NOTE: order is important
                     * all submit-handlers are attached via bind first,
                     * so the last attached handler comes first
                     */


                    if (ngFabForm.config.disabledForms) {
                        setupDisabledForms(el, attrs);
                    }


                    // don't forget to cancel set timeouts
                    scope.$on('$destroy', function ()
                    {
                        if (formSubmitDisabledTimeout) {
                            $timeout.cancel(formSubmitDisabledTimeout);
                        }
                    });
                };
            }
        };
    });
