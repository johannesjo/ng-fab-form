angular.module('ngFabForm', [
    'ngMessages'
]);

angular.module('ngFabForm')
    .directive('form', ['$compile', '$timeout', 'ngFabForm', function ($compile, $timeout, ngFabForm)
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
                    formSubmitDisabledTimeout;

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

angular.module('ngFabForm')
    .directive('input', ['ngFabFormValidationsDirective', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    }]);

angular.module('ngFabForm')
    .directive('textarea', ['ngFabFormValidationsDirective', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    }]);

angular.module('ngFabForm')
    .directive('select', ['ngFabFormValidationsDirective', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    }]);

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

            // set in ms
            scrollAnimationTime: 500,

            // fixed offset for scroll to element
            scrollOffset: -100,


            // The following options are not configurable via the
            // ngFabFormOptions-directive as they need to be
            // available during the $compile-phase

            // option to disable forms by wrapping them in a disabled <fieldset> element
            disabledForms: true,

            // add noovalidate to forms
            setNovalidate: true,

            // set form-element names based on ngModel if not set
            // NOTE: not changeable via ngFabFormOptions-directive as it needs to
            // available during the $compile-phase
            // NOTE2: name-attributes are required to be set here
            // or manually for the validations to work
            setNamesByNgModel: true,

            // add asterisk to required fields (requires jQuery)
            setAsteriskForRequiredLabel: false,

            // asterisk string to be added if enabled (requires jQuery) and
            // setAsteriskForRequiredLabel-option set to true
            asteriskStr: '*',

            // the validation message prefix, results for the default state
            // `validation-msg-required` or `validation-msg-your-custom-validation`
            validationMsgPrefix: 'validationMsg',

            // default email-regex, set to false to deactivate overwrite
            emailRegex: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,

            // in very rare cases (e.g. for some form-builders) your form
            // controller might not be ready before your model-controllers are,
            // for those instances set this option to true
            watchForFormCtrl: false,

            // name of the change event, change if there are conflicts
            formChangeEvent: 'NG_FAB_FORM_OPTIONS_CHANGED'
        };


        // *****************
        // SERVICE-FUNCTIONS
        // *****************
        function addCustomValidations(html, attrs)
        {
            var container = angular.element(angular.element('<div/>').html(html));
            angular.forEach(attrs, function (attr, attrKey)
            {
                var regExp = new RegExp(config.validationMsgPrefix);
                if (attrKey.match(regExp)) {
                    var sanitizedKey = attrKey.replace(config.validationMsgPrefix, '');
                    sanitizedKey = sanitizedKey.charAt(0).toLowerCase() + sanitizedKey.slice(1);
                    var message = container[0].querySelector('[ng-message="' + sanitizedKey + '"]');
                    angular.element(message).text(attr);
                }
            });
            return container;
        }

        var insertErrorTpl = function (compiledAlert, el, attrs)
            {
                // insert after or after parent if checkbox or radio
                if (attrs.type === 'checkbox' || attrs.type === 'radio') {
                    el.parent().after(compiledAlert);
                } else {
                    el.after(compiledAlert);
                }
            },

            scrollTo = (function ()
            {
                // t: current time, b: begInnIng value, c: change In value, d: duration
                // see: https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
                // and: http://upshots.org/actionscript/jsas-understanding-easing
                function easeInOutQuad(t, b, c, d)
                {
                    if ((t /= d / 2) < 1) {
                        return c / 2 * t * t + b;
                    }
                    return -c / 2 * ((--t) * (t - 2) - 1) + b;
                }

                // longer scroll duration for longer distances
                function scaleTimeToDistance(distance, duration)
                {
                    var baseDistance = 500;
                    var distanceAbs = Math.abs(distance);
                    var min = duration / 10;
                    return duration * distanceAbs / baseDistance + min;
                }


                return function (targetEl, durationP, scrollOffset)
                {
                    function animateScroll()
                    {
                        currentTime += increment;
                        var val = easeInOutQuad(currentTime, start, change, duration);
                        window.scrollTo(targetX, val);

                        if (currentTime < duration) {
                            setTimeout(animateScroll, increment);
                        } else {
                            targetEl.focus();
                        }
                    }

                    var targetY = targetEl.getBoundingClientRect().top + parseInt(scrollOffset),
                        targetX = targetEl.getBoundingClientRect().left;
                    var duration = scaleTimeToDistance(targetY, durationP);

                    var start = window.pageYOffset,
                        change = targetY,
                        currentTime = 0,
                        increment = 20;

                    // return if no animation is required
                    if (change === 0) {
                        targetEl.focus();
                        return;
                    }

                    // init recursive function
                    animateScroll();
                };
            }());

        var customValidators;

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
            setScrollToFn: function (scrollToFn)
            {
                scrollTo = scrollToFn;
            },
            setCustomValidatorsFn: function (customValidatorsFn)
            {
                customValidators = customValidatorsFn;
            },


            // ************************************************
            // ACTUAL FACTORY FUNCTION - used by the directives
            // ************************************************

            $get: function ()
            {
                return {
                    insertErrorTpl: insertErrorTpl,
                    addCustomValidations: addCustomValidations,
                    customValidators: customValidators,
                    scrollTo: scrollTo,
                    config: config
                };
            }
        };
    });

angular.module('ngFabForm').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('default-validation-msgs.html',
    "<div ng-messages=\"field.$error\" class=\"validation\" ng-show=\"attrs.required==''|| attrs.required\"><ul class=\"list-unstyled validation-errors\" ng-show=\"field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)\"><li ng-message=\"required\">This field is required</li><li ng-message=\"ngFabEnsureExpression\">Not valid condition</li><li ng-message=\"password\">Please enter a valid password</li><li ng-message=\"email\">Please enter a valid e-mail</li><li ng-message=\"pattern\">Invalid input format</li><li ng-message=\"date\">Please enter a valid date</li><li ng-message=\"time\">Please enter a valid time</li><li ng-message=\"datetime\">Please enter a valid date and time</li><li ng-message=\"datetime-local\">Please enter a valid date and time</li><li ng-message=\"number\">This field must be numeric</li><li ng-message=\"color\">Please enter a valid color</li><li ng-message=\"range\">Please enter a valid range</li><li ng-message=\"month\">Please enter a valid month</li><li ng-message=\"url\">Please enter a valid URL</li><li ng-message=\"file\">Invalid file</li><li ng-message=\"minlength\">Please use at least {{ attrs.minlength }} characters</li><li ng-message=\"maxlength\">Please do not exceed {{ attrs.maxlength }} characters</li><li ng-message=\"ngFabMatch\">The {{ attrs.type ==='password'? 'passwords' : 'values' }} should match</li><li ng-if=\"attrs.type == 'time' \" ng-message=\"min\">The time provided should after {{ attrs.min |date: 'HH:MM' }}</li><li ng-message=\"max\" ng-if=\"attrs.type == 'time' \">The time provided should be before {{attrs.max |date: 'HH:MM'}}</li><li ng-message=\"min\" ng-if=\"attrs.type == 'date' \">The date provided should be after {{attrs.min |date:'dd.MM.yy'}}</li><li ng-message=\"max\" ng-if=\"attrs.type == 'date' \">The date provided should be before {{attrs.max |date: 'dd.MM.yy'}}</li></ul><div class=\"validation-success\" ng-show=\"field.$valid && !field.$invalid\"></div></div>"
  );

}]);

angular.module('ngFabForm')
    .factory('ngFabFormValidationsDirective', ['ngFabForm', '$compile', '$templateRequest', '$rootScope', '$timeout', function (ngFabForm, $compile, $templateRequest, $rootScope, $timeout)
    {
        'use strict';


        function insertValidationMsgs(params)
        {
            var scope = params.scope,
                el = params.el,
                cfg = params.cfg,
                formCtrl = params.formCtrl,
                ngModelCtrl = params.ngModelCtrl,
                attrs = params.attrs;

            // remove error tpl if any
            if (params.currentValidationVars.tpl && (Object.keys(params.currentValidationVars.tpl).length !== 0)) {
                angular.element(params.currentValidationVars.tpl).remove();
            }

            // load validation directive template
            $templateRequest(cfg.validationsTemplate)
                .then(function processTemplate(html)
                {
                    // add custom (attr) validations
                    html = ngFabForm.addCustomValidations(html, attrs);

                    // create new scope for validation messages
                    var privateScope = $rootScope.$new(true);
                    privateScope.attrs = attrs;
                    privateScope.form = formCtrl;
                    privateScope.field = ngModelCtrl;

                    // compile and insert messages
                    var compiledAlert = $compile(html.children())(privateScope);
                    params.currentValidationVars.tpl = compiledAlert[0];

                    // timeout needed here to wait for the template to evaluate
                    $timeout(function ()
                    {
                        ngFabForm.insertErrorTpl(compiledAlert[0], el, attrs);
                    });
                });
        }


        function setAsteriskForLabel(el, attrs, cfg)
        {
            var labels = document.querySelectorAll('label[for="' + attrs.name + '"]');
            // if nothing is found check previous element
            if (!labels || labels.length < 1) {
                var elBefore = el[0].previousElementSibling;
                if (elBefore && elBefore.tagName === 'LABEL') {
                    labels = [elBefore];
                }
            }

            // set asterisk for match(es)
            if (labels && labels.length > 0 && attrs.type !== 'radio' && attrs.type !== 'checkbox') {
                for (var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    // don't append twice if multiple inputs with the same name
                    if (label.innerText.slice(-cfg.asteriskStr.length) !== cfg.asteriskStr) {
                        label.innerText = label.innerText + cfg.asteriskStr;
                    }
                }
            }
        }


        // return factory
        return {
            restrict: 'E',
            require: '?ngModel',
            compile: function (el, attrs)
            {
                // don't execute for buttons
                if (attrs.type) {
                    if (attrs.type.toLowerCase() === 'submit' || attrs.type.toLowerCase() === 'button') {
                        return;
                    }
                }

                // only execute if ng-model is present and
                // no name attr is set already
                // NOTE: needs to be set in $compile-function for the validation too work
                if (ngFabForm.config.setNamesByNgModel && attrs.ngModel && !attrs.name) {
                    // set name attribute if none is set
                    el.attr('name', attrs.ngModel);
                    attrs.name = attrs.ngModel;
                }


                // Linking function
                return function (scope, el, attrs, ngModelCtrl)
                {

                    var cfg,
                    // assigned via element.controller
                        formCtrl,
                    // is object to pass by reference
                        currentValidationVars = {
                            tpl: undefined
                        };


                    function ngFabFormCycle(oldCfg)
                    {
                        // apply validation messages
                        // only if required controllers and validators are set
                        if (ngModelCtrl && cfg.validationsTemplate && ((Object.keys(ngModelCtrl.$validators).length !== 0) || (Object.keys(ngModelCtrl.$asyncValidators).length !== 0)) && (!oldCfg || cfg.validationsTemplate !== oldCfg.validationsTemplate)) {
                            insertValidationMsgs({
                                scope: scope,
                                el: el,
                                cfg: cfg,
                                formCtrl: formCtrl,
                                ngModelCtrl: ngModelCtrl,
                                attrs: attrs,
                                currentValidationVars: currentValidationVars
                            });
                        }
                        // otherwise remove if a tpl was set before
                        else if (!cfg.validationsTemplate && currentValidationVars.tpl && (Object.keys(currentValidationVars.tpl).length !== 0)) {
                            angular.element(currentValidationVars.tpl).remove();
                        }

                        // set asterisk for labels
                        if (cfg.setAsteriskForRequiredLabel && attrs.required === true && (!oldCfg || cfg.setAsteriskForRequiredLabel !== oldCfg.setAsteriskForRequiredLabel || cfg.asteriskStr !== oldCfg.asteriskStr)) {
                            setAsteriskForLabel(el, attrs, cfg);
                        }
                    }

                    function init()
                    {
                        $timeout(function ()
                        {
                            // if controller is not accessible via require
                            // get it from the element
                            formCtrl = el.controller('form');

                            // only execute if formCtrl is set
                            if (formCtrl && ngModelCtrl) {
                                // get configuration from parent form
                                if (!cfg) {
                                    cfg = formCtrl.ngFabFormConfig;
                                }

                                // overwrite email-validation
                                if (cfg.emailRegex && attrs.type === 'email') {
                                    ngModelCtrl.$validators.email = function (value)
                                    {
                                        return ngModelCtrl.$isEmpty(value) || cfg.emailRegex.test(value);
                                    };
                                }

                                if (ngFabForm.customValidators) {
                                    ngFabForm.customValidators(ngModelCtrl, attrs);
                                }

                                ngFabFormCycle();


                                // watch for config changes
                                scope.$on(ngFabForm.formChangeEvent, function (ev, newCfg, oldCfg)
                                {
                                    cfg = newCfg;
                                    ngFabFormCycle(oldCfg);
                                });
                            }
                        }, 0);
                    }

                    // INIT
                    // after formCtrl should be ready
                    if (ngFabForm.config.watchForFormCtrl) {
                        var formCtrlWatcher = scope.$watch(function ()
                        {
                            return el.controller('form');
                        }, function (newVal)
                        {
                            if (newVal) {
                                formCtrlWatcher();
                                init();
                            }
                        });
                    } else {
                        init();
                    }
                };
            }
        };
    }]);

angular.module('ngFabForm')
    .directive('ngFabEnsureExpression', ['$http', '$parse', function ($http, $parse) {
        'use strict';

        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, ngModelController) {
                scope.$watch(attrs.ngModel, function () {
                    var booleanResult = $parse(attrs.ngFabEnsureExpression)(scope);
                    ngModelController.$setValidity('ngFabEnsureExpression', booleanResult);
                     ngModelController.$validate();
                });
            }
        };
}]);

angular.module('ngFabForm')
    .directive('ngFabMatch', function match()
    {
        'use strict';

        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                ngFabMatch: '='
            },
            link: function (scope, el, attrs, ngModel)
            {
                ngModel.$validators.ngFabMatch = function (modelValue)
                {
                    return Boolean(modelValue) && modelValue == scope.ngFabMatch;
                };
                scope.$watch('ngFabMatch', function ()
                {
                    ngModel.$validate();
                });
            }
        };
    }).directive('ngFabEnsureExpression', ['$http', '$parse', function($http, $parse) {
return {
require: 'ngModel',
link: function(scope, ele, attrs, ngModelController) {
scope.$watch(attrs.ngModel, function(value) {
var booleanResult = $parse(attrs.ngFabEnsureExpression)(scope);
ngModelController.$setValidity('ngFabEnsureExpression', booleanResult);
});
}
};
}]);
