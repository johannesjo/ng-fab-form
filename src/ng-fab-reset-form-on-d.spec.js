describe('a button with ngFabResetFormOn-directive', function ()
{
    'use strict';

    var scope,
        $timeout,
        $rootScope,
        $compile,
        formEl,
        resetBtnEl,
        inputEl,
        form,
        messageContainer;

    beforeEach(module('ngFabForm'));

    describe('standard', function ()
    {
        beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_)
        {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            $timeout = _$timeout_;
            scope = $rootScope.$new();


            formEl = $compile('<form name="testForm">' +
            '<input type="text" ng-model="inp" required >' +
            '<button type="button" ng-fab-reset-form-on>Reset</button>' +
            '</form>')(scope);
            $timeout.flush();
            scope.$digest();


            form = scope.testForm;
            inputEl = angular.element(formEl.children()[0]);
            messageContainer = angular.element(formEl.children()[1]);
            resetBtnEl = angular.element(formEl.children()[2]);
        }));

        it('should reset a valid form field and its form', function ()
        {
            form.inp.$setViewValue('some-value');

            resetBtnEl.triggerHandler('click');
            scope.$digest();

            // the field
            expect(scope.inp).toBe(undefined);
            expect(inputEl.hasClass('ng-pristine')).toBeTruthy();
            expect(inputEl.hasClass('ng-dirty')).toBeFalsy();
            expect(inputEl.hasClass('ng-untouched')).toBeTruthy();

            // the form
            expect(formEl.hasClass('ng-pristine')).toBeTruthy();
            expect(formEl.hasClass('ng-dirty')).toBeFalsy();
            expect(form.$triedSubmit).toBeFalsy();
        });

    });

    describe('with multiple events (touchstart click custom)', function ()
    {
        beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_)
        {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            $timeout = _$timeout_;
            scope = $rootScope.$new();


            formEl = $compile('<form name="testForm">' +
            '<input type="text" ng-model="inp" required >' +
            '<button type="button" ng-fab-reset-form-on="touchstart click custom">Reset</button>' +
            '</form>')(scope);
            $timeout.flush();
            scope.$digest();


            form = scope.testForm;
            inputEl = angular.element(formEl.children()[0]);
            messageContainer = angular.element(formEl.children()[1]);
            resetBtnEl = angular.element(formEl.children()[2]);
        }));


        it('should reset a form for click event', function ()
        {
            form.inp.$setViewValue('some-value');

            resetBtnEl.triggerHandler('click');
            scope.$digest();

            // the field
            expect(scope.inp).toBe(undefined);
            expect(inputEl.hasClass('ng-pristine')).toBeTruthy();
            expect(inputEl.hasClass('ng-dirty')).toBeFalsy();
            expect(inputEl.hasClass('ng-untouched')).toBeTruthy();

            // the form
            expect(formEl.hasClass('ng-pristine')).toBeTruthy();
            expect(formEl.hasClass('ng-dirty')).toBeFalsy();
            expect(form.$triedSubmit).toBeFalsy();
        });


        it('should reset a form for touchstart event', function ()
        {
            form.inp.$setViewValue('some-value');

            resetBtnEl.triggerHandler('touchstart');
            scope.$digest();

            // the field
            expect(scope.inp).toBe(undefined);
            expect(inputEl.hasClass('ng-pristine')).toBeTruthy();
            expect(inputEl.hasClass('ng-dirty')).toBeFalsy();
            expect(inputEl.hasClass('ng-untouched')).toBeTruthy();

            // the form
            expect(formEl.hasClass('ng-pristine')).toBeTruthy();
            expect(formEl.hasClass('ng-dirty')).toBeFalsy();
            expect(form.$triedSubmit).toBeFalsy();
        });


        it('should reset a form for custom event', function ()
        {
            form.inp.$setViewValue('some-value');

            resetBtnEl.triggerHandler('custom');
            scope.$digest();

            // the field
            expect(scope.inp).toBe(undefined);
            expect(inputEl.hasClass('ng-pristine')).toBeTruthy();
            expect(inputEl.hasClass('ng-dirty')).toBeFalsy();
            expect(inputEl.hasClass('ng-untouched')).toBeTruthy();

            // the form
            expect(formEl.hasClass('ng-pristine')).toBeTruthy();
            expect(formEl.hasClass('ng-dirty')).toBeFalsy();
            expect(form.$triedSubmit).toBeFalsy();
        });
    });


    describe('with doNotClearInputs attribute', function ()
    {
        beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_)
        {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            $timeout = _$timeout_;
            scope = $rootScope.$new();

            formEl = $compile('<form name="testForm">' +
            '<input type="text" ng-model="inp" required >' +
            '<button type="button" ng-fab-reset-form-on="touchstart click" do-not-clear-inputs="true">Reset</button>' +
            '</form>')(scope);
            $timeout.flush();
            scope.$digest();

            form = scope.testForm;
            inputEl = angular.element(formEl.children()[0]);
            messageContainer = angular.element(formEl.children()[1]);
            resetBtnEl = angular.element(formEl.children()[2]);
        }));


        it('should reset a form for touchstart event', function ()
        {
            form.inp.$setViewValue('some-value');

            resetBtnEl.triggerHandler('touchstart');
            scope.$digest();

            // the field
            expect(scope.inp).toBe('some-value');
            expect(inputEl.hasClass('ng-pristine')).toBeTruthy();
            expect(inputEl.hasClass('ng-dirty')).toBeFalsy();
            expect(inputEl.hasClass('ng-untouched')).toBeTruthy();

            // the form
            expect(formEl.hasClass('ng-pristine')).toBeTruthy();
            expect(formEl.hasClass('ng-dirty')).toBeFalsy();
            expect(form.$triedSubmit).toBeFalsy();
        });
    });
});



