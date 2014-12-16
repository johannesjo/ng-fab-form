angular.module('ngFabForm')
    .directive('form', function ($compile, $timeout, ngFabForm)
    {
        'use strict';

        // HELPER VARIABLES
        var formNames = [];


        // HELPER FUNCTIONS
        function preventFormSubmit(ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
        }

        function removeFromArray(arr)
        {
            var what, a = arguments, L = a.length, ax;
            while (L > 1 && arr.length) {
                what = a[--L];
                while ((ax = arr.indexOf(what)) !== -1) {
                    arr.splice(ax, 1);
                }
            }
            return arr;
        }


        // CONFIGURABLE ACTIONS
        function setupDisabledForms(el, attrs)
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
        }


        function scrollToAndFocusFirstErrorOnSubmit(el, formCtrl, scrollAnimationTime, scrollOffset)
        {
            var scrollTargetEl = el[0].querySelector('.ng-invalid');
            if (scrollTargetEl && formCtrl.$invalid) {
                // if no jquery just go to element
                ngFabForm.scrollTo(scrollTargetEl, parseInt(scrollAnimationTime), scrollOffset);
            }
        }


        return {
            restrict: 'E',
            scope: false,
            require: 'form',
            compile: function (el, attrs)
            {
                var cfg = angular.copy(ngFabForm.config);

                var formCtrlInCompile,
                    scopeInCompile,
                    formSubmitDisabledTimeout,
                    newFormName;

                // error helper for unique name issues
                if (attrs.name) {
                    if (formNames.indexOf(attrs.name) > -1) {
                        newFormName = attrs.name + formNames.length;
                        console.warn('ngFabForm: duplicate form name "' + attrs.name + '", setting name to: ' + newFormName);
                    } else {
                        formNames.push(attrs.name);
                    }
                } else {
                    newFormName = 'ngFabForm' + formNames.length;
                    console.warn('ngFabForm: all forms should have a unique name set, setting name to: ' + newFormName);
                }
                if (newFormName) {
                    el.attr('name', newFormName);
                    attrs.name = newFormName;
                }


                // autoset novalidate
                if (!attrs.novalidate && cfg.setNovalidate) {
                    // set name attribute if none is set
                    el.attr('novalidate', true);
                    attrs.novalidate = true;
                }

                // SUBMISSION HANDLING
                el.bind('submit', function (ev)
                {
                    // set dirty if option is set
                    if (cfg.setFormDirtyOnSubmit) {
                        scopeInCompile.$apply(function ()
                        {
                            formCtrlInCompile.$triedSubmit = true;
                        });
                    }

                    // prevent submit for invalid if option is set
                    if (cfg.preventInvalidSubmit && !formCtrlInCompile.$valid) {
                        preventFormSubmit(ev);
                    }

                    // prevent double submission if option is set
                    else if (cfg.preventDoubleSubmit) {
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
                        }, cfg.preventDoubleSubmitTimeoutLength);
                    }

                    if (cfg.scrollToAndFocusFirstErrorOnSubmit) {
                        scrollToAndFocusFirstErrorOnSubmit(el, formCtrlInCompile, cfg.scrollAnimationTime, cfg.scrollOffset);
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

                    // default state for new form variables
                    formCtrl.$triedSubmit = false;
                    formCtrl.$preventDoubleSubmit = false;
                    formCtrl.ngFabFormConfig = cfg;


                    // disabledForm 'directive'
                    if (cfg.disabledForms) {
                        setupDisabledForms(el, attrs);
                    }

                    // ngFabFormOptions 'directive'
                    if (attrs.ngFabFormOptions) {
                        scope.$watch(attrs.ngFabFormOptions, function (mVal)
                        {
                            if (mVal) {

                                var oldCfg = angular.copy(cfg);
                                cfg = formCtrl.ngFabFormConfig = angular.extend(cfg, mVal);

                                // broadcast event and config to input directives
                                scope.$broadcast('NG_FAB_FORM_OPTIONS_CHANGED_FOR_' + formCtrl.$name, cfg, oldCfg);
                            }
                        }, true);
                    }

                    // on unload
                    scope.$on('$destroy', function ()
                    {
                        // don't forget to cancel set timeouts
                        if (formSubmitDisabledTimeout) {
                            $timeout.cancel(formSubmitDisabledTimeout);
                        }

                        // remove from helper array
                        removeFromArray(formNames, formCtrl.$name);
                    });
                };
            }
        };
    });
