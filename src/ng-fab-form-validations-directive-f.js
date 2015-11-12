angular.module('ngFabForm')
    .factory('ngFabFormValidationsDirective', ['ngFabForm', '$compile', '$templateRequest', function (ngFabForm, $compile, $templateRequest)
    {
        'use strict';


        function insertValidationMsgs(params)
        {
            var el = params.el;
            var cfg = params.cfg;
            var formCtrl = params.formCtrl;
            var ngModelCtrl = params.ngModelCtrl;
            var attrs = params.attrs;
            var dScope = params.scope;


            // remove error tpl if any
            if (params.currentValidationVars.tpl && (Object.keys(params.currentValidationVars.tpl).length !== 0)) {
                angular.element(params.currentValidationVars.tpl).remove();
            }

            // load validation directive template
            $templateRequest(cfg.validationsTemplate)
                .then(function processTemplate(html)
                {
                    // create new scope for validation messages
                    var privateScope = dScope.$new(true);
                    // assign to currentValidationVars to be destroyed later
                    params.currentValidationVars.privateScope = privateScope;

                    // add custom (attr) validations
                    html = ngFabForm.addCustomValidations(html, attrs);

                    privateScope.attrs = attrs;
                    privateScope.form = formCtrl;
                    privateScope.field = ngModelCtrl;

                    // compile and insert messages
                    var compiledAlert = $compile(html.children())(privateScope);
                    params.currentValidationVars.tpl = compiledAlert[0];

                    ngFabForm.insertErrorTpl(compiledAlert[0], el, attrs);
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
                    if (label.textContent.slice(-cfg.asteriskStr.length) !== cfg.asteriskStr) {
                        label.textContent = label.textContent + cfg.asteriskStr;
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
                // NOTE: needs to be set in $compile-function for the
                // validation to work
                if (ngFabForm.config.setNamesByNgModel && attrs.ngModel && !attrs.name && !ngFabForm.config.globalFabFormDisable) {
                    // set name attribute if none is set
                    el.attr('name', attrs.ngModel);
                    attrs.name = attrs.ngModel;
                }

                // Linking function
                return function (scope, el, attrs, ngModelCtrl)
                {

                    var cfg;
                    // assigned via element.controller
                    var formCtrl;
                    var configChangeWatcher;
                    var formCtrlWatcher;
                    var currentValidationVars = {
                        // is in object to be passed by reference
                        tpl: undefined,
                        privateScope: undefined
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

                            // otherwise remove if a tpl was set before
                        } else if (!cfg.validationsTemplate && currentValidationVars.tpl && (Object.keys(currentValidationVars.tpl).length !== 0)) {
                            // don't forget to destroy the scope
                            currentValidationVars.privateScope.$destroy();
                            angular.element(currentValidationVars.tpl).remove();
                        }

                        // set asterisk for labels
                        if (cfg.setAsteriskForRequiredLabel && attrs.required === true && (!oldCfg || cfg.setAsteriskForRequiredLabel !== oldCfg.setAsteriskForRequiredLabel || cfg.asteriskStr !== oldCfg.asteriskStr)) {
                            setAsteriskForLabel(el, attrs, cfg);
                        }
                    }

                    function init()
                    {
                        scope.$evalAsync(function ()
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

                                // if globally disabled by the globalFabFormDisable setting
                                // and there is still no config available return
                                if (!cfg) {
                                    return;
                                }


                                // overwrite email-validation
                                if (cfg.emailRegex && attrs.type === 'email') {
                                    ngModelCtrl.$validators.email = function (value)
                                    {
                                        return ngModelCtrl.$isEmpty(value) || cfg.emailRegex.test(value);
                                    };
                                }

                                // set custom validators
                                if (ngFabForm.customValidators) {
                                    ngFabForm.customValidators(ngModelCtrl, attrs);
                                }

                                // start first cycle
                                ngFabFormCycle();


                                // watch for config changes
                                configChangeWatcher = scope.$on(ngFabForm.formChangeEvent, function (ev, newCfg, oldCfg)
                                {
                                    cfg = newCfg;
                                    ngFabFormCycle(oldCfg);
                                });
                            }
                        });
                    }

                    // INIT
                    // after formCtrl should be ready
                    if (ngFabForm.config.watchForFormCtrl) {
                        formCtrlWatcher = scope.$watch(function ()
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

                    scope.$on('$destroy', function ()
                    {
                        // destroy private scope set for validations if it was set
                        if (currentValidationVars && currentValidationVars.privateScope) {
                            currentValidationVars.privateScope.$destroy();
                        }
                    });
                };
            }
        };
    }]);
