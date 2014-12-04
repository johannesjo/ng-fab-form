angular.module('ngFabForm', []);

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
                    var scrollTargetEl = el.find('.ng-invalid')[0];
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

angular.module('ngFabForm')
    .directive('maxFileSize', function (maxUploadSizeInByte)
    {
        'use strict';

        var config = {
            maxUploadSizeInByte: maxUploadSizeInByte,
            validationKey: 'maxFileSize'
        };

        return {
            restrict: 'A',
            require: '?ngModel',
            scope: {
                'ngModel': '=',
                'maxFileSize': '@'
            },
            link: function (scope, el, attrs, ngModel)
            {
                var maxFileSize;

                // only assign once
                if (!scope.maxFileSize || parseFloat(scope.maxFileSize) > 0) {
                    maxFileSize = config.maxUploadSizeInByte;
                } else {
                    maxFileSize = scope.maxFileSize;
                }

                scope.$watch('ngModel', function (newVal)
                {
                    if (newVal instanceof Array) {
                        ngModel.$setViewValue(newVal);

                        // if one of the selected files is bigger than allowed
                        // set validation-status to false
                        var isValid = true;
                        for (var i = 0; i < scope.ngModel.length; i++) {
                            var file = scope.ngModel[i];
                            if (file.size > maxFileSize) {
                                isValid = false;
                                break;
                            }
                        }
                        ngModel.$setValidity(config.validationKey, isValid);
                    } else {
                        ngModel.$setValidity(config.validationKey, true);
                    }

                    // set third $watch param to true for object equality
                }, true);
            }
        };
    });

angular.module('ngFabForm')
    .directive('input', function (ngFabFormDirective)
    {
        'use strict';

        return ngFabFormDirective;
    });

angular.module('ngFabForm')
    .directive('textarea', function ($compile, ngFabFormDirective)
    {
        'use strict';

        return ngFabFormDirective;
    });

angular.module('ngFabForm')
    .directive('select', function (ngFabFormDirective)
    {
        'use strict';

        return ngFabFormDirective;
    });

angular.module('ngFabForm')
    .factory('ngFabFormDirective', function (ngFabForm, $compile, $templateRequest, $rootScope)
    {
        'use strict';

        // return factory
        return {
            restrict: 'E',
            require: ['?^form', '?ngModel'],
            compile: function (el, attrs)
            {
                // only execute if ng-model is present and
                // no name attr is set already
                if (attrs.ngModel && !attrs.name) {
                    // set name attribute if none is set
                    var newNameAttr = attrs.ngModel.replace(/\./g, '_');
                    el.attr('name', newNameAttr);
                    attrs.name = newNameAttr;
                }

                /**
                 * linking function
                 */
                return function (scope, el, attrs, controllers)
                {
                    var formCtrl = controllers[0],
                        ngModelCtrl = controllers[1];

                    // only execute if there is a form and model controller
                    var tpl = ngFabForm.config.template;
                    if (formCtrl && ngModelCtrl && tpl) {
                        // load validation directive template
                        $templateRequest(tpl)
                            .then(function processTemplate(html)
                            {
                                var privateScope = $rootScope.$new(true);
                                //privateScope.params = alertParams;
                                privateScope.attrs = attrs;
                                privateScope.field = scope[formCtrl.$name][ngModelCtrl.$name];
                                privateScope.error = scope[formCtrl.$name][ngModelCtrl.$name].$error;
                                var compiledAlert = $compile(html)(privateScope);
                                ngFabForm.insertErrorTpl(compiledAlert, el, attrs);
                            });
                    }


                    // set asterisk for labels
                    if (ngFabForm.config.setAsteriskForRequiredLabel && attrs.required === true) {
                        var label = $('label[for=' + attrs.name + ']');
                        if (label.length < 1) {
                            label = el.prev('label');
                        }
                        if (label && label[0]) {
                            if (attrs.type !== 'radio' && attrs.type !== 'checkbox') {
                                label[0].innerText = label[0].innerText + ngFabForm.config.asteriskStr;
                            }
                        }
                    }
                }
                    ;
            }
        };
    });

angular.module('ngFabForm')
    .provider('ngFabForm', function ngFabFormProvider()
    {
        'use strict';

        // *****************
        // DEFAULTS & CONFIG
        // *****************

        var config = {
            // template-url/templateId
            // to disable validation alltogether set it false
            template: 'ng-fab-form-default-validation.tpl.html',

            // prevent submission of invalid forms
            preventInvalidSubmit: true,

            // prevent double clicks
            preventDoubleSubmit: true,

            // double click delay duration
            preventDoubleSubmitTimeoutLength: 1000,

            // show validation-messages on failed submit
            setFormDirtyOnSubmit: true,

            // autofocus first error-element
            scrollToAndFocusFirstErrorOnSubmit: true,

            // set either to fixed duration or to 'smooth'
            // 'smooth' means that the duration is calculated,
            // based on the distance to scroll (the more the faster it scrolls)
            scrollAnimationTime: 'smooth',

            // fixed offset for scroll to elment
            scrollOffset: -100,

            // option to disable forms by wrapping them in a disabled <fieldset> elment
            disabledForms: true,

            // add noovalidate to forms
            setNovalidate: true,

            // add asterisk to required fields
            setAsteriskForRequiredLabel: false,

            // asterisk string to be added if enabled
            asteriskStr: '*',

            // event-name-space, usually you won't need to change anything here
            eventNameSpace: 'ngFabForm',

            // the validation message prefix, results for the default state
            // `validation-msg-required` or `validation-msg-your-custom-validation`
            validationMsgPrefix: 'validationMsg'
        };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************
        var insertErrorTpl = function (compiledAlert, el, attrs)
        {
            // insert after or after parent if checkbox or radio
            if (attrs.type === 'checkbox' || attrs.type === 'radio') {
                el.parent().after(compiledAlert);
            } else {
                el.after(compiledAlert);
            }
        };


        // *************************
        // PROVIDER-CONFIG-FUNCTIONS
        // *************************

        return {
            extendConfig: function (newConfig)
            {
                config = angular.extend(config, newConfig);
            },
            setInsertErrorTplFn: function (insertErrorTplFn)
            {
                insertErrorTpl = insertErrorTplFn;
            },


            // ************************************************
            // ACTUAL FACTORY FUNCTION - used by the directives
            // ************************************************

            $get: function ()
            {
                return {
                    insertErrorTpl: insertErrorTpl,
                    config: config,
                };
            }
        };
    });

angular.module('ngFabForm')
    .directive('ngFabVal', function ()
    {
        'use strict';

        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'ng-fab-val-d.html',
            link: function (scope, el, attrs, controller)
            {

            }
        };
    });

/* jshint quotmark: false */

angular.module('ngFabForm')
    .run(function ($templateCache, ngFabForm)
    {
        'use strict';

        var tpl = "";
        tpl += "<div ng-messages=\"field.$error\"";
        tpl += "     class=\"help-block\">";
        tpl += "    <ul class=\"list-unstyled\"";
        tpl += "        ng-show=\"field.$invalid && (field.$touched || field.$dirty)\">";
        tpl += "        <li ng-message=\"required\">You did not enter a field<\/li>";
        tpl += "        <li ng-message=\"password\">This is not a valid password<\/li>";
        tpl += "        <li ng-message=\"email\"> This is not a valid email-address<\/li>";
        tpl += "        <li ng-message=\"pattern\">pattern Your input does not match the requirements<\/li>";
        tpl += "        <li ng-message=\"date\">This is not a valid date<\/li>";
        tpl += "        <li ng-message=\"time\">This is not a valid time<\/li>";
        tpl += "        <li ng-message=\"datetime\"> This is no valid datetime<\/li>";
        tpl += "        <li ng-message=\"datetime-local\">This is no valid local datetime<\/li>";
        tpl += "        <li ng-message=\"number\">This is no valid number<\/li>";
        tpl += "        <li ng-message=\"color\">This no valid color<\/li>";
        tpl += "        <li ng-message=\"range\">This is not a valid range<\/li>";
        tpl += "        <li ng-message=\"month\">This is not a valid month<\/li>";
        tpl += "        <li ng-message=\"url\">This is not a valid url<\/li>";
        tpl += "        <li ng-message=\"file\">This not a valid file<\/li>";
        tpl += "        <li ng-message=\"minlength\">Your field should have at least {{ attrs.minlength }} characters<\/li>";
        tpl += "        <li ng-message=\"maxlength\">Your field should have max {{ attrs.maxlength }} characters<\/li>";
        tpl += "        <li ng-if=\"attrs.type == 'time' \"";
        tpl += "            ng-message=\"min\">The time provided should be no earlier than {{ attrs.min |date: 'HH:MM' }}";
        tpl += "        <\/li>";
        tpl += "        <li ng-message=\"max\"";
        tpl += "            ng-if=\"attrs.type == 'time' \">The time should be no later than {{attrs.max |date: 'HH:MM'}}";
        tpl += "        <\/li>";
        tpl += "        <li ng-message=\"min\"";
        tpl += "            ng-if=\"attrs.type == 'date' \">The date provided should be no earlier than then {{attrs.max";
        tpl += "            |date:'dd.MM.yy'}}";
        tpl += "        <\/li>";
        tpl += "        <li ng-message=\"max\"";
        tpl += "            ng-if=\"attrs.type == 'date' \">The time should be no later than {{attrs.max |date: 'dd.MM.yy'}}";
        tpl += "        <\/li>";
        tpl += "    <\/ul>";
        tpl += "<\/div>";
        tpl += "";

        $templateCache.put(ngFabForm.config.template, tpl);
    });

//# sourceMappingURL=ng-fab-form.min.js.map