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
    .factory('ngFabFormDirective', function (ngFabForm, $compile, $timeout)
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
                    if (formCtrl && ngModelCtrl) {
                        // wait for validators to be ready
                        $timeout(function ()
                        {
                            var alertTpl = ngFabForm.makeAlertTpl(formCtrl.$name, attrs, ngModelCtrl.$validators);
                            var compiledAlert = $compile(alertTpl)(scope);

                            ngFabForm.insertErrorTpl(compiledAlert, el, attrs);
                        });
                    }

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
                showErrorsOn: [
                    '$touched', // if element was focussed
                    '$dirty' // if element was edited
                ],
                // add noovalidate to forms
                setNovalidate: true,

                // add asterisk to required fields
                setAsteriskForRequiredLabel: false,

                // asterisk string to be added if enabled
                asteriskStr: '*',

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

                // event-name-space, usually you won't need to change anything here
                eventNameSpace: 'ngFabForm',

                // the validation message prefix, results for the default state
                // `validation-msg-required` or `validation-msg-your-custom-validation`
                validationMsgPrefix: 'validationMsg',


                // uses advanced dynamic validations,e .g. for min and max
                useAdvancedValidationMsgs: true,
                dateFormat: 'dd.MM.yy',
                timeFormat: 'HH:MM'
            },

            validationMessages = {
                // types
                email: 'This is not a valid email-address',
                password: 'This is not a valid password',
                date: 'This is not a valid date',
                time: 'This is not a valid time',
                datetime: 'This is no valid datetime',
                'datetime-local': 'This is no valid local datetime',
                number: 'This is no valid number',
                color: 'This no valid color',
                range: 'This is not a valid range',
                month: 'This is not a valid month',
                url: 'This is not a valid url',
                file: 'This not a valid file',

                // attributes
                required: 'This field is required',
                pattern: 'Your input does not match the requirements',
                size: 'This no valid size',

                // special validations (over written if
                // specialValidations is set to true
                max: 'Your input is too large',
                min: 'Your input is too short',
                maxlength: 'Your input is too long',
                minlength: 'Your input is too short'
            },

        // used to check for key value pairs in attributes if value is string
        // the function attributes are used to create the message
            advancedValidations = [
                // for all inputs
                {
                    maxlength: function (attrs)
                    {
                        return 'Your input should have max ' + attrs.maxlength + ' characters';
                    },
                    minlength: function (attrs)
                    {
                        return 'Your input should have at least ' + attrs.minlength + ' characters';
                    }
                },
                // date-fields
                {
                    type: 'time',
                    min: function (attrs)
                    {
                        return 'The time provided should be no earlier than {{"' + attrs.min + '"|date:"' + config.timeFormat + '"}}';
                    },
                    max: function (attrs)
                    {
                        return 'The time should be no later than {{"' + attrs.max + '"|date:"' + config.timeFormat + '"}}';
                    }
                },
                // date
                {
                    type: 'date',
                    min: function (attrs)
                    {
                        return 'The date provided should be no earlier than the {{"' + attrs.min + '"|date:"' + config.dateFormat + '"}}';
                    },
                    max: function (attrs)
                    {
                        return 'The date provided should be no later than the {{"' + attrs.max + '"|date:"' + config.dateFormat + '"}}';
                    }
                }
            ];


        // *****************
        // HELPER FUNCTIONS
        // ****************

        var makeAlertWrapperTpl = function (ngShowCondition, formName, elName, messages)
            {
                var msgs = '';
                angular.forEach(messages, function (msg, key)
                {
                    msgs += '<li ng-message="' + key + '">' + msg + '</li>';
                });

                return '<div ng-show="' + ngShowCondition + '"' +
                    'ng-messages="' + formName + '.' + elName + '.$error" ' +
                    'class="help-block with-errors">' +
                    '<ul class ="list-unstyled">' +
                    msgs +
                    '</ul></div>';
            },


            makeMsgs = function (validators, attrs)
            {
                var allMgs = {},
                    customMsgs = {};

                // special handlers
                setMgsForSpecialValidationCombinations(attrs, customMsgs);

                // check for custom validation msgs added via validation-attribute
                angular.forEach(attrs, function (attr, attrKey)
                {
                    var regExp = new RegExp(config.validationMsgPrefix);
                    if (attrKey.match(regExp)) {
                        var sanitizedKey = attrKey.replace(config.validationMsgPrefix, '');
                        sanitizedKey = sanitizedKey.charAt(0).toLowerCase() + sanitizedKey.slice(1);
                        customMsgs[sanitizedKey] = attr;
                    }
                });
                angular.forEach(validators, function (validator, validatorKey)
                {
                    if (customMsgs && customMsgs[validatorKey]) {
                        allMgs[validatorKey] = customMsgs[validatorKey];
                    } else {
                        allMgs[validatorKey] = validationMessages[validatorKey];
                    }
                });

                return allMgs;
            },

            setMgsForSpecialValidationCombinations = function (attrs, customMsgs)
            {
                var applyRule,
                    msgFnKeys;

                var parseSpecialValidations = function (val, key)
                {
                    if (applyRule) {
                        if (angular.isFunction(val)) {
                            msgFnKeys.push(key);
                        } else {
                            applyRule = (attrs[key] && attrs[key] === val);
                        }
                    }
                };

                if (config.useAdvancedValidationMsgs) {
                    for (var i = 0; i < advancedValidations.length; i++) {
                        var validationObj = advancedValidations[i];
                        applyRule = true;
                        msgFnKeys = [];
                        angular.forEach(validationObj, parseSpecialValidations);
                        if (applyRule && msgFnKeys.length > 0) {
                            for (var j = 0; j < msgFnKeys.length; j++) {
                                var msgFnKey = msgFnKeys[j];
                                customMsgs[msgFnKey] = validationObj[msgFnKey](attrs);
                            }
                        }
                    }
                }
            };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************

        var makeAlertTpl = function (formName, attrs, validators)
            {
                var elName = attrs.name;

                var ngShowCondition = formName + '.' + elName + '.$invalid';
                ngShowCondition += ' && (';
                angular.forEach(config.showErrorsOn, function (state, index)
                {
                    if (index === 0) {
                        ngShowCondition += formName + '.' + elName + '.' + state;
                    } else {
                        ngShowCondition += ' || ' + formName + '.' + elName + '.' + state;
                    }
                });
                ngShowCondition += '|| ' + formName + '.$triedSubmit';
                ngShowCondition += ')';


                var messages = makeMsgs(validators, attrs);
                return makeAlertWrapperTpl(ngShowCondition, formName, elName, messages);
            },


            insertErrorTpl = function (compiledAlert, el, attrs)
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
            extendValidationMessages: function (newValidationMessages)
            {
                validationMessages = angular.extend(validationMessages, newValidationMessages);
            },
            extendConfig: function (newConfig)
            {
                config = angular.extend(config, newConfig);
            },
            setWrapperTplFunction: function (tplFunction)
            {
                makeAlertWrapperTpl = tplFunction;
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
                    makeAlertTpl: makeAlertTpl,
                    config: config,
                    validationMessages: validationMessages,
                    advancedValidations: advancedValidations
                };
            }
        };
    });

//# sourceMappingURL=ng-fab-form.min.js.map