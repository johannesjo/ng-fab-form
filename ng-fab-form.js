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
                if (ngFabForm.config.setNamesByNgModel && attrs.ngModel && !attrs.name) {
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
                        ngModelCtrl = controllers[1],
                        validationsTpl = ngFabForm.config.validationsTemplate;

                    // apply validation messages
                    // only if required controllers and validators are set
                    if (ngFabForm.config.showValidationMsgs && formCtrl && ngModelCtrl && validationsTpl && (Object.keys(ngModelCtrl.$validators).length !== 0)) {

                        // load validation directive template
                        $templateRequest(validationsTpl)
                            .then(function processTemplate(html)
                            {
                                // add custom (attr) validations
                                html = ngFabForm.addCustomValidations(html, ngModelCtrl.$validators, attrs);

                                // create new scope for validation messages
                                var privateScope = $rootScope.$new(true);
                                privateScope.attrs = attrs;
                                privateScope.form = scope[formCtrl.$name];
                                privateScope.field = scope[formCtrl.$name][ngModelCtrl.$name];

                                // compile and insert messages
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
                };
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
            // validation template-url/templateId
            // to disable validation completely set it false
            validationsTemplate: 'default-validation-msgs.html',

            // show validation messages
            showValidationMsgs: true,

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

            // set form-element names based on ngModel if not set
            setNamesByNgModel: true,

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
            },
            addCustomValidations = function (html, validators, attrs)
            {
                var container = angular.element('<div/>').html(html);
                angular.forEach(attrs, function (attr, attrKey)
                {
                    var regExp = new RegExp(config.validationMsgPrefix);
                    if (attrKey.match(regExp)) {
                        var sanitizedKey = attrKey.replace(config.validationMsgPrefix, '');
                        sanitizedKey = sanitizedKey.charAt(0).toLowerCase() + sanitizedKey.slice(1);
                        var message = container.find('[ng-message="' + sanitizedKey + '"]');
                        message.text(attr);
                    }
                });
                return container;
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
                    addCustomValidations: addCustomValidations,
                    config: config
                };
            }
        };
    });

angular.module('ngFabForm').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('default-validation-msgs.html',
    "<div ng-messages=\"field.$error\"\n" +
    "     class=\"validation\">\n" +
    "    <ul class=\"list-unstyled validation-errors\"\n" +
    "        ng-show=\"field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)\">\n" +
    "        <li ng-message=\"required\">This field is required</li>\n" +
    "        <li ng-message=\"password\">This is not a valid password</li>\n" +
    "        <li ng-message=\"email\"> This is not a valid email-address</li>\n" +
    "        <li ng-message=\"pattern\">Your input does not match the requirements</li>\n" +
    "        <li ng-message=\"date\">This is not a valid date</li>\n" +
    "        <li ng-message=\"time\">This is not a valid time</li>\n" +
    "        <li ng-message=\"datetime\"> This is no valid datetime</li>\n" +
    "        <li ng-message=\"datetime-local\">This is no valid local datetime</li>\n" +
    "        <li ng-message=\"number\">This is no valid number</li>\n" +
    "        <li ng-message=\"color\">This no valid color</li>\n" +
    "        <li ng-message=\"range\">This is not a valid range</li>\n" +
    "        <li ng-message=\"month\">This is not a valid month</li>\n" +
    "        <li ng-message=\"url\">This is not a valid url</li>\n" +
    "        <li ng-message=\"file\">This not a valid file</li>\n" +
    "\n" +
    "        <li ng-message=\"minlength\">Your field should have at least {{ attrs.minlength }} characters</li>\n" +
    "        <li ng-message=\"maxlength\">Your field should have max {{ attrs.maxlength }} characters</li>\n" +
    "\n" +
    "        <li ng-if=\"attrs.type == 'time' \"\n" +
    "            ng-message=\"min\">The time provided should be no earlier than {{ attrs.min |date: 'HH:MM' }}\n" +
    "        </li>\n" +
    "        <li ng-message=\"max\"\n" +
    "            ng-if=\"attrs.type == 'time' \">The time should be no later than {{attrs.max |date: 'HH:MM'}}\n" +
    "        </li>\n" +
    "        <li ng-message=\"min\"\n" +
    "            ng-if=\"attrs.type == 'date' \">The date provided should be no earlier than then {{attrs.max\n" +
    "            |date:'dd.MM.yy'}}\n" +
    "        </li>\n" +
    "        <li ng-message=\"max\"\n" +
    "            ng-if=\"attrs.type == 'date' \">The time should be no later than {{attrs.max |date: 'dd.MM.yy'}}\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <div class=\"validation-success\"\n" +
    "         ng-show=\"field.$valid && !field.$invalid\">\n" +
    "    </div>\n" +
    "</div>\n"
  );

}]);

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

//# sourceMappingURL=ng-fab-form.min.js.map