angular.module('ngFabForm')
    .factory('ngFabFormDirective', ['$compile', '$timeout', 'ngFabForm', function ($compile, $timeout, ngFabForm)
    {

        'use strict';

        // HELPER FUNCTIONS
        function preventFormSubmit(ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
        }


        // CONFIGURABLE ACTIONS
        function setupDisabledForms(el, attrs)
        {
            // watch disabled form if set (requires jQuery)
            if (attrs.disableForm) {
                el.contents().wrap('<fieldset>');
                var fieldSetWrapper = el.children();
                attrs.$observe('disableForm', function ()
                {
                    // NOTE attrs get parsed as string
                    if (attrs.disableForm === 'true' || attrs.disableForm === true) {
                        fieldSetWrapper.attr('disabled', true);
                    } else {
                        fieldSetWrapper.attr('disabled', false);
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
            restrict: 'EAC',
            scope: false,
            require: '?^form',
            compile: function (el, attrs)
            {
                // create copy of configuration object as it might be modified by ngFabFormOptions
                var cfg = angular.copy(ngFabForm.config),
                    formSubmitDisabledTimeout;

                // if global disable and fab-form not explicitly set
                if (cfg.globalFabFormDisable === true && angular.isUndefined(attrs.ngFabForm)) {
                    return;
                }

                // autoset novalidate
                if (!attrs.novalidate && cfg.setNovalidate) {
                    // set name attribute if none is set
                    el.attr('novalidate', true);
                    attrs.novalidate = true;
                }

                /**
                 * linking functions
                 */
                return {
                    pre: function (scope, el, attrs, formCtrl)
                    {
                        // SUBMISSION HANDLING
                        // set in pre-linking function for event handlers
                        // to be set before other bindings (ng-submit)
                        el.bind('submit', function (ev)
                        {
                            // set dirty if option is set
                            if (cfg.setFormDirtyOnSubmit) {
                                scope.$apply(function ()
                                {
                                    formCtrl.$triedSubmit = true;
                                });
                            }

                            // prevent submit for invalid if option is set
                            if (cfg.preventInvalidSubmit && !formCtrl.$valid) {
                                preventFormSubmit(ev);
                            }

                            // prevent double submission if option is set
                            else if (cfg.preventDoubleSubmit) {
                                if (formCtrl.$preventDoubleSubmit) {
                                    preventFormSubmit(ev);
                                }

                                // cancel timeout if set before
                                if (formSubmitDisabledTimeout) {
                                    $timeout.cancel(formSubmitDisabledTimeout);
                                }

                                formCtrl.$preventDoubleSubmit = true;
                                formSubmitDisabledTimeout = $timeout(function ()
                                {
                                    formCtrl.$preventDoubleSubmit = false;
                                }, cfg.preventDoubleSubmitTimeoutLength);
                            }

                            if (cfg.scrollToAndFocusFirstErrorOnSubmit) {
                                scrollToAndFocusFirstErrorOnSubmit(el, formCtrl, cfg.scrollAnimationTime, cfg.scrollOffset);
                            }
                        });
                    },
                    post: function (scope, el, attrs, formCtrl)
                    {
                        // default state for new form variables
                        formCtrl.$triedSubmit = false;
                        formCtrl.$preventDoubleSubmit = false;
                        formCtrl.ngFabFormConfig = cfg;
                        formCtrl.$resetForm = function (resetValues)
                        {
                            if (resetValues === true) {
                                var inputElements = el[0].querySelectorAll('input, select');
                                for (var i = 0; i < inputElements.length; i++) {
                                    var inputEl = angular.element(inputElements[i]);
                                    var inputElCtrl = inputEl.controller('ngModel');
                                    if (inputElCtrl) {
                                        inputElCtrl.$setViewValue('');
                                        inputElCtrl.$render();
                                    }
                                }
                            }

                            formCtrl.$triedSubmit = false;
                            formCtrl.$setPristine();
                            formCtrl.$setUntouched();
                        };

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
                                    scope.$broadcast(ngFabForm.formChangeEvent, cfg, oldCfg);
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
                        });
                    }
                };
            }
        };


    }]);
