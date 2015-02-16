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

        // see http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        function generateUUID()
        {
            /* jshint ignore:start */
            var d = new Date().getTime();
            return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
            {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            /* jshint ignore:end */
        }

        function checkSetUniqueName(el, attrs)
        {
            var newFormName;
            if (attrs.name) {
                if (formNames.indexOf(attrs.name) > -1) {
                    newFormName = attrs.name + '_' + generateUUID();
                    console.warn('ngFabForm: duplicate form name "' + attrs.name + '", setting name to: ' + newFormName);
                }
            } else {
                newFormName = 'ngFabForm_' + generateUUID();
                console.warn('ngFabForm: all forms should have a unique name set, setting name to: ' + newFormName);
            }
            if (newFormName) {
                el.attr('name', newFormName);
                attrs.name = newFormName;
            }
            formNames.push(attrs.name);
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
            restrict: 'E',
            scope: false,
            require: 'form',
            compile: function (el, attrs)
            {
                var cfg = ngFabForm.config,
                    formSubmitDisabledTimeout,
                    newFormName;

                // error helper for unique name issues
                checkSetUniqueName(el, attrs);

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
                    }
                };
            }
        };
    });
