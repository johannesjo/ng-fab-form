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


    describe('with an input', function ()
    {
        var element, form, submitCount;

        beforeEach(function ()
        {
            var html = '<form name="myForm" ng-submit="submitFn()"><input type="text" ng-model="testModel" required></form>';
            submitCount = 0;
            scope = $rootScope.$new();
            scope.submitFn = function ()
            {
                submitCount++;
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

        it('should NOT be submittable if input is valid', function ()
        {
            scope.testModel = null;
            element.triggerHandler('submit');
            expect(scope.submitFn).not.toHaveBeenCalled();
        });

        it('should only be submitted once', function ()
        {
            scope.testModel = 'some input provided';
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            expect(submitCount).toBe(1);
        });

        it('should have $triedSubmit set after submit attempt', function ()
        {
            element.triggerHandler('submit');
            expect(form.$triedSubmit).toBeTruthy();
        });
    });


    describe('with an input', function ()
    {
        var element, form, submitCount;

        beforeEach(function ()
        {
            var html = '<form name="myForm" ng-submit="submitFn()"><input type="text" ng-model="testModel" required></form>';
            submitCount = 0;
            scope = $rootScope.$new();
            scope.submitFn = function ()
            {
                submitCount++;
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

        it('should NOT be submittable if input is valid', function ()
        {
            scope.testModel = null;
            element.triggerHandler('submit');
            expect(scope.submitFn).not.toHaveBeenCalled();
        });

        it('should only be submitted once', function ()
        {
            scope.testModel = 'some input provided';
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            element.triggerHandler('submit');
            expect(submitCount).toBe(1);
        });

        it('should have $triedSubmit set after submit attempt', function ()
        {
            element.triggerHandler('submit');
            expect(form.$triedSubmit).toBeTruthy();
        });
    });
});


