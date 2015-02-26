angular.module('ngFabForm', [
    'ngMessages'
]);

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

angular.module('ngFabForm')
    .directive('input', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    });

angular.module('ngFabForm')
    .directive('textarea', function ($compile, ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
    });

angular.module('ngFabForm')
    .directive('select', function (ngFabFormValidationsDirective)
    {
        'use strict';

        return ngFabFormValidationsDirective;
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
            emailRegex: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
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


            // ************************************************
            // ACTUAL FACTORY FUNCTION - used by the directives
            // ************************************************

            $get: function ()
            {
                return {
                    insertErrorTpl: insertErrorTpl,
                    addCustomValidations: addCustomValidations,
                    scrollTo: scrollTo,
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
    "        <li ng-message=\"match\">The {{ attrs.type ==='password'? 'passwords' : 'values' }} should match</li>\n" +
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

angular.module('ngFabForm')
    .factory('ngFabFormValidationsDirective', function (ngFabForm, $compile, $templateRequest, $rootScope, $timeout)
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
            require: ['?^form', '?ngModel'],
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
                return function (scope, el, attrs, controllers)
                {

                    var formCtrl = controllers[0],
                        cfg,
                        ngModelCtrl = controllers[1],
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

                    // INIT
                    // after formCtrl should be ready
                    $timeout(function ()
                    {
                        // only execute if formCtrl is set
                        if (formCtrl) {
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

                            ngFabFormCycle();


                            // watch for config changes
                            scope.$on('NG_FAB_FORM_OPTIONS_CHANGED_FOR_' + formCtrl.$name, function (ev, newCfg, oldCfg)
                            {
                                cfg = newCfg;
                                ngFabFormCycle(oldCfg);
                            });
                        }
                    }, 0);
                };
            }
        };
    });

angular.module('ngFabForm')
    .directive('match', function match()
    {
        'use strict';

        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                match: '='
            },
            link: function (scope, el, attrs, ngModel)
            {
                ngModel.$validators.match = function (modelValue)
                {
                    return Boolean(modelValue) && modelValue == scope.match;
                };
                scope.$watch('match', function ()
                {
                    ngModel.$validate();
                });
            }
        };
    });

//# sourceMappingURL=ng-fab-form.min.js.map