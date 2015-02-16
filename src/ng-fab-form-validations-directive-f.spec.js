describe('validations directive', function ()
{
    'use strict';

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

    describe('simple required input', function ()
    {
        // TODO run all tests for all kind of input elements

        var element,
            form,
            input,
            messageContainer;

        beforeEach(function ()
        {
            var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
                '<input type="text" ng-model="testInput" required>' +
                '</form>';
            element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here
            $timeout.flush();
            form = scope.testForm;
            input = angular.element(element.children()[0]);
            messageContainer = angular.element(element.children()[1]);
        });


        it('should set a name according to model', function ()
        {
            expect(input.attr('name')).toBe('testInput');
        });

        it('should have a validation template appended', function ()
        {
            expect(messageContainer.length > 0).toBeTruthy();
        });

        it('display a validation message if invalid and no success message', function ()
        {
            // we have to use $setViewValue otherwise the formCtrl
            // will not update properly
            form.testInput.$setViewValue(null);

            var message = messageContainer.find('li');
            expect(message.length).toBe(1);
            expect(message.attr('ng-message')).toBe('required');
            expect(message.text()).toBe('This field is required');

            var successMessage = messageContainer.find('div');
            expect(successMessage.hasClass('ng-hide')).toBe(true);
        });

        it('display success if valid and no error messages', function ()
        {
            form.testInput.$setViewValue('bla bla bla');

            var successMessage = messageContainer.find('div');
            expect(successMessage.length).toBe(1);
            expect(successMessage.hasClass('ng-hide')).toBe(false);

            var message = messageContainer.find('li');
            expect(message.length).toBe(0);
        });

        it('display messages according to option', function ()
        {
            scope.customFormOptions = {
                validationsTemplate: false
            };
            scope.$digest();
            form.testInput.$setViewValue(null);
            messageContainer = angular.element(element.children()[1]);
            expect(messageContainer).toEqual({});

            scope.customFormOptions.validationsTemplate = 'default-validation-msgs.html';
            form.testInput.$setViewValue(null);
            scope.$digest();
            messageContainer = angular.element(element.children()[1]);
            expect(messageContainer).not.toEqual({});

            var message = messageContainer.find('li');
            expect(message.length).toBe(1);
            expect(message.attr('ng-message')).toBe('required');
            expect(message.text()).toBe('This field is required');

            var successMessage = messageContainer.find('div');
            expect(successMessage.hasClass('ng-hide')).toBe(true);
        });
    });

    it('should display a custom validation if set', function ()
    {
        var element = $compile('<form name="testForm">' +
        '<input type="text" ng-model="testInput" validation-msg-required ="some custom message" required>' +
        '</form>')(scope);
        scope.$digest();
        $timeout.flush();
        var form = scope.testForm;

        // we have to use $setViewValue otherwise the formCtrl
        // will not update properly
        form.testInput.$setViewValue(null);

        var messageContainer = angular.element(element.children()[1]);
        var message = messageContainer.find('li');

        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('required');
        expect(message.text()).toBe('some custom message');
    });


    it('should work with nested model values', function ()
    {
        var element = $compile('<form name="testForm">' +
        '<input type="text" ng-model="testInput.deeper.andDeeper.andDeeper" required>' +
        '</form>')(scope);
        scope.$digest();
        $timeout.flush();

        var form = scope.testForm;
        var messageContainer = angular.element(element.children()[1]);

        form['testInput.deeper.andDeeper.andDeeper'].$setViewValue('test aa');

        var successMessage = messageContainer.find('div');
        expect(successMessage.length).toBe(1);
        expect(successMessage.hasClass('ng-hide')).toBe(false);

        var message = messageContainer.find('li');
        expect(message.length).toBe(0);
    });
});
