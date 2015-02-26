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
            // another flush is needed as the template is set after
            // a timeout
            $timeout.flush();

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

    it('should overwrite email-validations with a better pattern', function ()
    {
        var element = $compile('<form name="testForm">' +
        '<input type="email" ng-model="testInput" validation-msg-email ="some custom message" required>' +
        '</form>')(scope);
        scope.$digest();
        $timeout.flush();
        var form = scope.testForm;

        // we have to use $setViewValue otherwise the formCtrl
        // will not update properly
        form.testInput.$setViewValue('email@email');

        var messageContainer = angular.element(element.children()[1]);
        var message = messageContainer.find('li');

        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('email');
        expect(message.text()).toBe('some custom message');

        // test correct email
        form.testInput.$setViewValue('email@asdasd.de');
        var successMessage = messageContainer.find('div');
        expect(successMessage.length).toBe(1);
        expect(successMessage.hasClass('ng-hide')).toBe(false);
        message = messageContainer.find('li');
        expect(message.length).toBe(0);
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


    describe('non inputs and checkboxes', function ()
    {
        it('textarea -display a validation message if invalid and no success message', function ()
        {
            var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
                '<textarea ng-model="testInput" required></textarea>' +
                '</form>';
            var element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here
            $timeout.flush();
            var form = scope.testForm;
            var messageContainer = angular.element(element.children()[1]);

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

        it('textarea -display a validation message if invalid and no success message', function ()
        {
            var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
                '<select ng-model="testInput" required><option value=""></option></select>' +
                '</form>';
            var element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here
            $timeout.flush();
            var form = scope.testForm;
            var messageContainer = angular.element(element.children()[1]);

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

        it('input:checkbox -display a validation message if invalid and no success message', function ()
        {
            var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
                '<label>' +
                '<input type="checkbox" ng-model="testInput" required>' +
                '</label>' +
                '</form>';
            var element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here
            $timeout.flush();
            var form = scope.testForm;
            var messageContainer = angular.element(element.children()[1]);

            // we have to use $setViewValue otherwise the formCtrl
            // will not update properly
            form.testInput.$setViewValue(false);

            var message = messageContainer.find('li');
            expect(message.length).toBe(1);
            expect(message.attr('ng-message')).toBe('required');
            expect(message.text()).toBe('This field is required');

            var successMessage = messageContainer.find('div');
            expect(successMessage.hasClass('ng-hide')).toBe(true);
        });
    });
});

describe('validations directive with config', function ()
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
        $compile,
        $document,
        element;


    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_, _$document_)
    {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        $document = _$document_;
        scope = $rootScope.$new();
    }));

    afterEach(function ()
    {
        element.remove();
    });

    it('displays an asterisk for labels with proper for attribute for a required field, if config is set', function ()
    {
        provider.extendConfig({
            setAsteriskForRequiredLabel: true,
            asteriskStr: '*'
        });

        var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
            '<input id="inpID" name="inpID" type="text" ng-model="testInput" required>' +
            '<div></div>' +
            '<label for="inpID">label</label>' +
            '</form>';

        // label needs to be appended to the dom to be found by
        // document.querySelector
        element = $compile(html)(scope);
        angular.element(document.body).append(element);

        scope.$digest();
        $timeout.flush();
        var label = document.querySelectorAll('label[for="inpID"]');
        label = angular.element(label[0]);
        expect(label.text()).toContain('*');
    });


    it('displays an asterisk for labels directly before a required field, if config is set', function ()
    {
        provider.extendConfig({
            setAsteriskForRequiredLabel: true,
            asteriskStr: '*'
        });

        var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
            '<label>label</label>' +
            '<input id="inpID" name="inpID" type="text" ng-model="testInput" required>' +
            '</form>';

        // needs to be appended to the dom to be found by
        // document.querySelector
        var element = $compile(html)(scope);
        angular.element(document.body).append(element);

        scope.$digest();
        $timeout.flush();
        var label = angular.element(element.children()[0]);
        label = angular.element(label[0]);
        expect(label.text()).toContain('*');
    });

    it('should display only one asterisk, if there are multiple inputs with the same name', function ()
    {
        var asteriskVal = '**';
        provider.extendConfig({
            setAsteriskForRequiredLabel: true,
            asteriskStr: asteriskVal
        });

        var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
            '<label for="inpID">label</label>' +
            '<input id="inpID" name="inpID" type="text" ng-model="inp" required>' +
            '<input id="inpID" name="inpID" type="text" ng-model="inp" required>' +
            '<div></div>' +
            '</form>';

        // label needs to be appended to the dom to be found by
        // document.querySelector
        element = $compile(html)(scope);
        angular.element(document.body).append(element);

        scope.$digest();
        $timeout.flush();
        var label = document.querySelectorAll('label[for="inpID"]');
        label = angular.element(label[0]);

        expect(label.text().slice(-2 * asteriskVal.length)).not.toBe(asteriskVal + asteriskVal);
    });

    it('should be able to deactivate email-validation overwrite', function ()
    {
        provider.extendConfig({
            emailRegex: false
        });

        var element = $compile('<form name="testForm">' +
        '<input type="email" ng-model="testInput" validation-msg-email ="some custom message" required>' +
        '</form>')(scope);
        scope.$digest();
        $timeout.flush();
        var form = scope.testForm;

        // we have to use $setViewValue otherwise the formCtrl
        // will not update properly
        form.testInput.$setViewValue('email@email');

        var messageContainer = angular.element(element.children()[1]);
        var message = messageContainer.find('li');

        expect(message.length).toBe(0);
    });
});


describe('validations with async validators', function ()
{
    'use strict';

    beforeEach(module('ngFabForm'));

    var scope,
        $timeout,
        $rootScope,
        $compile,
        $document,
        $templateCache,
        $q,
        element;


    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_, _$document_, _$templateCache_, _$q_)
    {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        $document = _$document_;
        $templateCache = _$templateCache_;
        $q = _$q_;
        scope = $rootScope.$new();
    }));


    it('should display validation messages, if there are async-validators', function ()
    {
        $templateCache.put('default-validation-msgs.html',
            '<div ng-messages="field.$error" class="validation">' +
            '<ul class="list-unstyled validation-errors" ng-show="field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)">' +
            '<li ng-message="unique">NOT_UNIQUE</li>' +
            '</ul>' +
            '</div>'
        );

        var scope = $rootScope.$new();

        var html = '<form name="testForm" ng-fab-form-options="customFormOptions">' +
            '<input type="text" ng-model="username">' +
            '</form>';

        element = $compile(html)(scope);
        var form = scope.testForm;
        var ngModel = form.username;


        ngModel.$asyncValidators.unique = function (modelValue, viewValue)
        {
            var deferred = $q.defer();
            $timeout(function ()
            {
                if (viewValue === 'NOT_UNIQUE') {
                    deferred.reject();

                } else {
                    deferred.resolve();
                }
            });
            return deferred.promise;
        };
        scope.$digest();
        $timeout.flush();


        // test test asyncValidator
        ngModel.$setViewValue('NOT_UNIQUE');
        $timeout.flush();
        expect(ngModel.$valid).toBeFalsy();
        ngModel.$setViewValue('asd');
        $timeout.flush();
        expect(ngModel.$valid).toBeTruthy();


        var messageContainer = angular.element(element.children()[1]);
        form.username.$setViewValue('NOT_UNIQUE');
        $timeout.flush();
        var message = messageContainer.find('li');
        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('unique');
        expect(message.text()).toBe('NOT_UNIQUE');

        form.username.$setViewValue('UNIQUE');
        $timeout.flush();
        message = messageContainer.find('li');
        expect(message.length).toBe(0);
    });
});
