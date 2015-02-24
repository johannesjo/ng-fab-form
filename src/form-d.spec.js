describe('a form', function ()
{
    'use strict';

    var helper = {};
    var scope,
        $timeout,
        $rootScope,
        $compile;

    beforeEach(module('ngFabForm'));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_)
    {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        scope = $rootScope.$new();
    }));


    it('without a name should auto- get a name', function ()
    {
        var element = $compile('<form></form>')(scope);
        scope.$digest();
        var formName = element.attr('name');
        expect(formName.length > 0).toBeTruthy();
    });


    it('and a second with the same name - the second should auto- get a new name', function ()
    {
        var html = '<form name="notUnique"></form>';
        scope = $rootScope.$new();
        var element1 = $compile(html)(scope),
            element2 = $compile(html)(scope);
        scope.$digest();

        var form1Name = element1.attr('name'),
            form2Name = element2.attr('name');
        expect(form1Name).not.toBe(form2Name);
    });


    it('could be disabled and enabled again', function ()
    {
        var element = $compile('<form name="myForm" disable-form="{{ formDisabled || false }}"><input type="text" ng-model="myModel"></form>')(scope);
        scope.$digest();
        $timeout.flush();

        var fieldsetWrapper = element.find('fieldset');

        scope.formDisabled = true;
        scope.$digest();
        expect(fieldsetWrapper.attr('disabled')).toBe('disabled');

        scope.formDisabled = false;
        scope.$digest();

        expect(fieldsetWrapper.attr('disabled')).not.toBe('disabled');
    });


    it('should have settable options', function ()
    {
        $compile('<form name="myForm" ng-fab-form-options="customFormOptions"></form>')(scope);
        scope.$digest();
        $timeout.flush();
        var form = scope.myForm;

        expect(form.ngFabFormConfig).toBeDefined();

        scope.customFormOptions = {
            validationsTemplate: false,
            preventInvalidSubmit: false,
            preventDoubleSubmit: false,
            setFormDirtyOnSubmit: true,
            scrollToAndFocusFirstErrorOnSubmit: true,
            scrollAnimationTime: 200,
            scrollOffset: -100
        };
        scope.$digest();

        for (var key in form.ngFabFormConfig) {
            if (typeof scope.customFormOptions[key] !== 'undefined') {
                expect(scope.customFormOptions[key]).toBe(form.ngFabFormConfig[key]);
            }
        }
    });


    describe('with an input', function ()
    {
        var element, form;

        beforeEach(function ()
        {
            var html = '<form name="myForm" ng-submit="submitFn()"  ng-fab-form-options="customFormOptions"><input type="text" ng-model="testModel" required></form>';
            scope = $rootScope.$new();
            scope.submitCount = 0;
            scope.submitFn = function ()
            {
                scope.submitCount++;
            };
            spyOn(scope, 'submitFn').and.callThrough();

            element = $compile(html)(scope);
            scope.$digest();
            $timeout.flush();

            form = scope.myForm;
        });

        it('should be submittable if input is valid', function ()
        {
            scope.testModel = 'some input provided';
            element.triggerHandler('submit');
            expect(scope.submitFn).toHaveBeenCalled();
        });

        it('should NOT be submittable if input is invalid', function ()
        {
            scope.testModel = null;
            element.triggerHandler('submit');
            expect(scope.submitFn).not.toHaveBeenCalled();
        });

        it('should be still submittable if input is invalid, but OPTION is deactivated', function ()
        {
            scope.testModel = null;
            scope.customFormOptions = {
                preventInvalidSubmit: false
            };
            element.triggerHandler('submit');
            expect(scope.submitFn).toHaveBeenCalled();
            expect(scope.submitCount).toBe(1);

            scope.customFormOptions = {
                preventInvalidSubmit: true
            };

            element.triggerHandler('submit');
            expect(scope.submitCount).toBe(1);
        });

        it('should only be submitted once', function ()
        {
            scope.testModel = 'some input provided';
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            expect(scope.submitCount).toBe(1);
        });

        it('could be submitted multiple times if OPTION is deactivated', function ()
        {
            scope.customFormOptions = {
                preventDoubleSubmit: false
            };
            scope.testModel = 'some input provided';
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            expect(scope.submitCount).toBe(3);
        });

        it('should have $triedSubmit set after submit attempt', function ()
        {
            element.triggerHandler('submit');
            expect(form.$triedSubmit).toBeTruthy();
        });
    });


    describe('with autofocus errors', function ()
    {
        var element, form, input;
        beforeEach(function ()
        {
            var html = '<form name="myForm" ng-fab-form-options="customFormOptions">' +
                '<input type="text" ng-model="testModel0" required>' +
                '<input type="text" ng-model="testModel1" required>' +
                '<input type="text" ng-model="testModel2" required>' +
                '</form>';
            scope = $rootScope.$new();
            element = $compile(html)(scope);
            scope.$digest();
            $timeout.flush();

            form = scope.myForm;
            input = element.find('input');
            spyOn(input[0], 'focus');
            spyOn(input[1], 'focus');
            spyOn(input[2], 'focus');

            scope.customFormOptions = {
                // set animation time to 0 for better testing
                scrollAnimationTime: 0
            };
        });

        it('should focus the first error-element(0) on submit', function ()
        {
            element.triggerHandler('submit');
            expect(input[0].focus).toHaveBeenCalled();
            expect(input[1].focus).not.toHaveBeenCalled();
            expect(input[2].focus).not.toHaveBeenCalled();
        });

        it('should focus the first error-element(1) on submit', function ()
        {
            form.testModel0.$setViewValue('blablablaba');
            element.triggerHandler('submit');
            expect(input[0].focus).not.toHaveBeenCalled();
            expect(input[1].focus).toHaveBeenCalled();
            expect(input[2].focus).not.toHaveBeenCalled();
        });

        it('should focus the first error-element(2) on submit', function ()
        {
            form.testModel0.$setViewValue('blablablaba');
            form.testModel1.$setViewValue('blablablaba');

            element.triggerHandler('submit');
            expect(input[0].focus).not.toHaveBeenCalled();
            expect(input[1].focus).not.toHaveBeenCalled();
            expect(input[2].focus).toHaveBeenCalled();
        });

        it('should not focus any error element, if OPTION is deactivated', function ()
        {
            scope.customFormOptions.scrollToAndFocusFirstErrorOnSubmit = false;
            element.triggerHandler('submit');
            expect(input[0].focus).not.toHaveBeenCalled();
            expect(input[1].focus).not.toHaveBeenCalled();
            expect(input[2].focus).not.toHaveBeenCalled();
        });
    });
});


describe('a form with config', function ()
{
    'use strict';

    var provider;

    beforeEach(module('ngFabForm', function (ngFabFormProvider)
    {
        provider = ngFabFormProvider;
    }));

    var scope,
        $timeout,
        $rootScope,
        $compile;


    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_)
    {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        scope = $rootScope.$new();
    }));

    it('can change all options via extend config', inject(function ()
    {
        var opts = {
            validationsTemplate: false,
            preventInvalidSubmit: false,
            preventDoubleSubmit: false,
            preventDoubleSubmitTimeoutLength: 100,
            setFormDirtyOnSubmit: false,
            scrollToAndFocusFirstErrorOnSubmit: false,
            scrollAnimationTime: 0,
            scrollOffset: -2100,
            disabledForms: false,
            setNovalidate: false,
            setNamesByNgModel: false,
            setAsteriskForRequiredLabel: false,
            asteriskStr: '***',
            validationMsgPrefix: 'validationMessssg',
            emailRegex : false
        };
        provider.extendConfig(opts);

        $compile('<form name="myForm"></form>')(scope);
        scope.$digest();
        $timeout.flush();
        var form = scope.myForm;

        expect(form.ngFabFormConfig).toBeDefined();

        for (var key in form.ngFabFormConfig) {
            if (typeof opts[key] !== 'undefined') {
                expect(opts[key]).toBe(form.ngFabFormConfig[key]);
            }
        }

        // giving all options are changed
        expect(provider.$get().config).toEqual(opts);
    }));


    it('can set a custom error-insert function', function ()
    {
        var customInsertFn = function ()
        {
        };
        provider.setInsertErrorTplFn(customInsertFn);
        expect(provider.$get().insertErrorTpl).toEqual(customInsertFn);
    });

    it('can set a custom scroll-to function', function ()
    {
        var customScrollFn = function ()
        {
        };
        provider.setScrollToFn(customScrollFn);
        expect(provider.$get().scrollTo).toEqual(customScrollFn);
    });
});



