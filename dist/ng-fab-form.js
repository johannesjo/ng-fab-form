angular.module('ngFabForm', []);

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
                var scrollTop = scrollTargetEl.offsetTop + scrollOffset;

                // if no jquery just go to element
                if (!window.$ || !scrollAnimationTime) {
                    scrollTargetEl.scrollIntoView();
                    scrollTargetEl.focus();
                }

                // otherwise scroll to element
                else {
                    var scrollActualAnimationTime = scrollAnimationTime;

                    var $scrollTargetEl = angular.element(scrollTargetEl);
                    $scrollTargetEl.addClass('is-scroll-target');
                    if (scrollAnimationTime) {
                        if (scrollAnimationTime === 'smooth') {
                            scrollActualAnimationTime = (Math.abs(window.scrollY - scrollTop)) / 4 + 200;
                        }

                        scrollActualAnimationTime = parseInt(scrollActualAnimationTime);

                        $('html, body').animate({
                            scrollTop: scrollTop
                        }, scrollActualAnimationTime, function ()
                        {
                            $scrollTargetEl.focus();
                            $scrollTargetEl.removeClass('is-scroll-target');
                        });
                    }
                }
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
                    formSubmitDisabledTimeout;

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


                    // error helper
                    if (formCtrl.$name) {
                        if (formNames.indexOf(formCtrl.$name) > -1) {
                            throw 'ngFabForm: duplicate form name "' + formCtrl.$name + '"';
                        } else {
                            formNames.push(formCtrl.$name);
                        }
                    } else {
                        throw 'ngFabForm: all forms should have a unique name set';
                    }


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
    .factory('ngFabFormDirective', function (ngFabForm, $compile, $templateRequest, $rootScope, $timeout)
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
                params.currentValidationVars.tpl.remove();
            }

            // load validation directive template
            $templateRequest(cfg.validationsTemplate)
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
                    params.currentValidationVars.tpl = compiledAlert[0];
                    ngFabForm.insertErrorTpl(compiledAlert[0], el, attrs);
                });
        }


        function setAsteriskForLabel(el, attrs, cfg)
        {
            // check if jquery is loaded
            if (window.$) {
                var label = $('label[for=' + attrs.name + ']');
                if (label.length < 1) {
                    label = el.prev('label');
                }

                if (label && label[0]) {
                    if (attrs.type !== 'radio' && attrs.type !== 'checkbox') {
                        label[0].innerText = label[0].innerText + cfg.asteriskStr;
                    }
                }
            } else {
                throw 'auto-setting an asterisk requires jQuery';
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
                    var newNameAttr = attrs.ngModel.replace(/\./g, '_');
                    el.attr('name', newNameAttr);
                    attrs.name = newNameAttr;
                }


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
                        // if there is no form-wrapper just return
                        if (!formCtrl) {
                            return;
                        }

                        // apply validation messages
                        // only if required controllers and validators are set
                        if (ngModelCtrl && cfg.validationsTemplate && (Object.keys(ngModelCtrl.$validators).length !== 0) && (!oldCfg || cfg.validationsTemplate !== oldCfg.validationsTemplate)) {
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
                            currentValidationVars.tpl.remove();
                        }

                        // set asterisk for labels
                        if (cfg.setAsteriskForRequiredLabel && attrs.required === true && (!oldCfg || cfg.setAsteriskForRequiredLabel !== oldCfg.setAsteriskForRequiredLabel || cfg.asteriskStr !== oldCfg.asteriskStr)) {
                            setAsteriskForLabel(el, attrs, cfg);
                        }
                    }

                    // wait for formCtrl to be ready
                    $timeout(function ()
                    {
                        // get configuration from parent form
                        if (!cfg) {
                            cfg = formCtrl.ngFabFormConfig;
                        }
                        ngFabFormCycle();
                    }, 0);

                    // watch for config changes
                    scope.$on('NG_FAB_FORM_OPTIONS_CHANGED_FOR_' + formCtrl.$name, function (ev, newCfg, oldCfg)
                    {
                        cfg = newCfg;
                        ngFabFormCycle(oldCfg);
                    });
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