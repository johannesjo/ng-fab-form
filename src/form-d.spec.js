describe('a form', function ()
{
    'use strict';

    var helper = {};

    beforeEach(module('ngFabForm'));

    describe('without name', function ()
    {
        var element, scope;

        beforeEach(inject(function ($rootScope, $compile)
        {
            var html = '<form></form>';
            scope = $rootScope.$new();
            element = $compile(html)(scope);
            scope.$digest();
        }));

        it('should auto- get a name', function ()
        {
            var formName = element.attr('name');
            expect(formName.length > 0).toBeTruthy();
        });
    });

    describe('and another with the same name', function ()
    {
        var element1, element2, scope;

        beforeEach(inject(function ($rootScope, $compile)
        {
            var html = '<form name="notUnique"></form>';
            scope = $rootScope.$new();
            element1 = $compile(html)(scope);
            element2 = $compile(html)(scope);
            scope.$digest();
        }));

        it('should auto- get a new name', function ()
        {
            var form1Name = element1.attr('name'),
                form2Name = element2.attr('name');
            expect(form1Name).not.toBe(form2Name);
        });
    });


    describe('with an input', function ()
    {
        var element, scope, form, submitCount;

        beforeEach(inject(function ($rootScope, $compile)
        {
            var html = '<form name="myForm" ng-submit="submitFn()"><input type="text" ng-model="testModel" required></form>';
            submitCount = 0;
            scope = $rootScope.$new();
            element = $compile(html)(scope);
            scope.$digest();

            form = scope.myForm;

            scope.submitFn = function ()
            {
                submitCount++;
            };
            spyOn(scope, 'submitFn').and.callThrough();

            scope.$digest();

        }));

        it('should be submittable if input is valid', function ()
        {
            scope.testModel = 'some input provided';
            element.submit();
            expect(scope.submitFn).toHaveBeenCalled();
        });

        it('should NOT be submittable if input is valid', function ()
        {
            scope.testModel = null;
            element.submit();
            expect(scope.submitFn).not.toHaveBeenCalled();
        });

        it('should only be submitted once', function ()
        {
            scope.testModel = 'some input provided';
            element.submit();
            element.submit();
            element.submit();
            expect(submitCount).toBe(1);
        });

        //it('should be $dirty and not $pristine after invalid submit', inject(function ($timeout)
        //{
        //    element.submit();
        //    scope.$digest();
        //    // as timeout is used, we need to flush it here
        //    $timeout.flush();
        //
        //    expect(form.$pristine).toBeFalsy();
        //    expect(form.$dirty).toBeFalsy();
        //}));
    });
});
