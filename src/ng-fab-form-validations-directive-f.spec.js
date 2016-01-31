describe('validations directive', function ()
{
    'use strict';

    var scope,
        $timeout,
        $rootScope,
        $compile;


    /**
     * @see http://stackoverflow.com/questions/18499909/how-to-count-total-number-of-watches-on-a-page
     * @param root
     */
    var getWatchCount = function (root)
    {
        var watchers = [];

        var f = function (element)
        {
            angular.forEach(['$scope', '$isolateScope'], function (scopeProperty)
            {
                if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
                    angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher)
                    {
                        watchers.push(watcher);
                    });
                }
            });

            angular.forEach(element.children(), function (childElement)
            {
                f(angular.element(childElement));
            });
        };

        f(root);

        // Remove duplicate watchers
        var watchersWithoutDuplicates = [];
        angular.forEach(watchers, function (item)
        {
            if (watchersWithoutDuplicates.indexOf(item) < 0) {
                watchersWithoutDuplicates.push(item);
            }
        });

        return watchersWithoutDuplicates.length;
    };

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
            messageContainer,
            watchCountAfterCompile;

        beforeEach(function ()
        {
            var html = '<form ng-fab-form-options="customFormOptions">' +
                '<input type="text" ng-model="testInput" required>' +
                '</form>';
            element = $compile(html)(scope);
            watchCountAfterCompile = getWatchCount(element);
            scope.$digest();
            // as timeout is used, we need to flush it here
            $timeout.flush();
            form = element.controller('form');
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

        it('validation watchers should be removed when the validation message container is', function ()
        {
            messageContainer.remove();
            expect(getWatchCount(element)).toBe(watchCountAfterCompile);
        });

        it('when scope is destroyed there should be no watchers left', function ()
        {
            scope.$destroy();
            expect(getWatchCount(element)).toBe(0);
        });

        it('display a validation message if invalid', function ()
        {
            // we have to use $setViewValue otherwise the formCtrl
            // will not update properly
            form.testInput.$setViewValue(null);

            var message = messageContainer.find('li');
            expect(message.length).toBe(1);
            expect(message.attr('ng-message')).toBe('required');
            expect(message.text()).toBe('This field is required');
        });

        it('display no success message if invalid', function ()
        {
            form.testInput.$setViewValue(null);
            var successMessage = messageContainer.find('div');
            expect(successMessage.hasClass('ng-hide')).toBe(true);
        });

        it('display success if valid and no error messages', function ()
        {
            form.testInput.$setViewValue('bla bla bla');
            var successMessage = messageContainer.find('div');
            expect(successMessage.length).toBe(1);
            expect(successMessage.hasClass('ng-hide')).toBe(false);
        });

        it('display no error message if valid', function ()
        {
            form.testInput.$setViewValue('bla bla bla');
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

    it('should not display a validation message for non required url input', function ()
    {
        var element = $compile('<form>' +
            '<input type="url" ng-model="testInput" >' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

        form.testInput.$setViewValue('xxx');
        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer.attr('class')).toContain('ng-hide');
    });

    it('should work inside of an isolate scope', function ()
    {
        var element = $compile('<form>' +
            '<div ng-if="true">' +
            '<input type="text" required ng-model="testInput" >' +
            '</div>' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');
        form.testInput.$setViewValue(null);

        var messageContainer = angular.element(element.find('div')[1]);
        var message = messageContainer.find('li');
        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('required');
        expect(message.text()).toBe('This field is required');
    });

    it('should not throw an error if removed from dom', function ()
    {
        $compile('<form>' +
            '<div ng-if="isPresentInDom">' +
            '<input type="text" required ng-model="testInput" >' +
            '</div>' +
            '</form>')(scope);
        scope.$digest();

        scope.isPresentInDom = true;
        scope.$digest();


        scope.isPresentInDom = false;
        scope.$digest();
    });

    it('should not display a validation message for non required email input', function ()
    {
        var element = $compile('<form>' +
            '<input type="email" ng-model="testInput" >' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

        form.testInput.$setViewValue('xxx');
        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer.attr('class')).toContain('ng-hide');
    });

    it('should not throw an error for input:email without ng-model', function ()
    {
        var element = $compile('<form>' +
            '<input type="email">' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

        var input = angular.element(element.children()[0]);
        input.val('ballbalbla');
        scope.$digest();

        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer.length).toBe(0);
    });

    it('should accept uppercase only emails as valid', function ()
    {
        var element = $compile('<form>' +
            '<input required="true" type="email" ng-model="testInput">' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');
        form.testInput.$setViewValue('MAIL@MAIL.DE');

        var messageContainer = angular.element(element.children()[1]);
        var message = messageContainer.find('li');
        expect(message.length).toBe(0);

        var successMessage = messageContainer.find('div');
        expect(successMessage.length).toBe(1);
    });

    it('should not throw an error for input:url without ng-model', function ()
    {
        var element = $compile('<form>' +
            '<input type="url">' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

        var input = angular.element(element.children()[0]);
        input.val('ballbalbla');
        scope.$digest();

        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer.length).toBe(0);
    });

    it('should not display errors for input:email with required attribute, when no ng-model is set', function ()
    {
        var element = $compile('<form>' +
            '<input type="email" required>' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

        var input = angular.element(element.children()[0]);
        input.val('ballbalbla');
        scope.$digest();

        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer.length).toBe(0);
    });

    it('should not display the success element for simple inputs', function ()
    {
        var element = $compile('<form>' +
            '<input type="url" ng-model="testInput" >' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');


        form.testInput.$setViewValue('http://blabla.de');
        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer.attr('class')).toContain('ng-hide');
    });

    it('should work for text-input with ng-required instead of required', function ()
    {
        var element = $compile('<form>' +
            '<input type="text" ng-required="true" ng-model="testInput" >' +
            '</form>')(scope);
        scope.$digest();


        var form = element.controller('form');
        form.testInput.$setViewValue(null);

        var messageContainer = angular.element(element.children()[1]);
        var messages = messageContainer.find('li');
        expect(messages.length).toBe(1);
        expect(messages.attr('ng-message')).toBe('required');
        expect(messages.text()).toBe('This field is required');
    });

    it('should display a custom validation if set', function ()
    {
        var element = $compile('<form>' +
            '<input type="text" ng-model="testInput" validation-msg-required ="some custom message" required>' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

        // we have to use $setViewValue otherwise the formCtrl
        // will not update properly
        form.testInput.$setViewValue(null);

        var messageContainer = angular.element(element.children()[1]);
        var message = messageContainer.find('li');

        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('required');
        expect(message.text()).toBe('some custom message');
    });

    it('should support html for custom validation messages', function ()
    {
        var element = $compile('<form>' +
            '<input type="text" ng-model="testInput" validation-msg-required ="<b>some</b> custom message" required>' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

        // we have to use $setViewValue otherwise the formCtrl
        // will not update properly
        form.testInput.$setViewValue(null);

        var messageContainer = angular.element(element.children()[1]);
        var message = messageContainer.find('li');

        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('required');
        expect(message.text()).toBe('some custom message');
        expect(message.html()).toBe('<b>some</b> custom message');
    });

    it('should work with delayed insert of input', function ()
    {
        var element = $compile('<form></form>')(scope);
        scope.$digest();
        var form = element.controller('form');

        $timeout(function ()
        {
            var input = $compile('<input type="text" ng-model="testInput"  required>')(scope);
            element.append(input);
        }, 200);
        $timeout.flush();

        scope.testInput = null;
        scope.$digest();


        var messageContainer = angular.element(element.children()[1]);

        var message = messageContainer.find('li');
        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('required');
        expect(message.text()).toBe('This field is required');

        var successMessage = messageContainer.find('div');
        expect(successMessage.hasClass('ng-hide')).toBe(true);
    });

    it('should work with real delayed insert of input', function (done)
    {
        var element,
            form,
            input,
            message,
            messageContainer,
            successMessage;

        element = $compile('<form></form>')(scope);
        scope.$digest();
        form = element.controller('form');

        setTimeout(function ()
        {
            input = $compile('<input type="text" ng-model="testInput"  required>')(scope);
            element.append(input);

            scope.testInput = null;
            scope.$digest();

            messageContainer = angular.element(element.children()[1]);
            message = messageContainer.find('li');
            successMessage = messageContainer.find('div');
            expect(message.length).toBe(1);
            expect(message.attr('ng-message')).toBe('required');
            expect(message.text()).toBe('This field is required');
            expect(successMessage.hasClass('ng-hide')).toBe(true);
            done();
        }, 25);
    });

    it('should work input being in another scope', function ()
    {
        var formScope = scope;
        var formEl = $compile('<form></form>')(formScope);
        var anotherScope = $rootScope.$new();
        var inputEl = $compile('<input type="text" ng-model="testInput"  required>')(anotherScope);

        formEl.append(inputEl);
        formScope.$digest();
        anotherScope.$digest();

        formScope.testInput = null;
        formScope.$digest();

        var messageContainer = angular.element(formEl.children()[1]);
        var message = messageContainer.find('li');
        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('required');
        expect(message.text()).toBe('This field is required');

        var successMessage = messageContainer.find('div');
        expect(successMessage.hasClass('ng-hide')).toBe(true);
    });

    it('should overwrite email-validations with a better pattern', function ()
    {
        var element = $compile('<form>' +
            '<input type="email" ng-model="testInput" validation-msg-email ="some custom message" required>' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

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
        var element = $compile('<form>' +
            '<input type="text" ng-model="testInput.deeper.andDeeper.andDeeper" required>' +
            '</form>')(scope);
        scope.$digest();


        var form = element.controller('form');
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
            var html = '<form ng-fab-form-options="customFormOptions">' +
                '<textarea ng-model="testInput" required></textarea>' +
                '</form>';
            var element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here

            var form = element.controller('form');
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

        it('select -display a validation message if invalid and no success message', function ()
        {
            var html = '<form ng-fab-form-options="customFormOptions">' +
                '<select ng-model="testInput" required><option value=""></option></select>' +
                '</form>';
            var element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here

            var form = element.controller('form');
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

        it('should work for a select with ng-required instead of required', function ()
        {
            var html = '<form ng-fab-form-options="customFormOptions">' +
                '<select ng-model="testInput" ng-required="true"><option value=""></option></select>' +
                '</form>';
            var element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here

            var form = element.controller('form');
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
            var html = '<form ng-fab-form-options="customFormOptions">' +
                '<label>' +
                '<input type="checkbox" ng-model="testInput" required>' +
                '</label>' +
                '</form>';
            var element = $compile(html)(scope);
            scope.$digest();
            // as timeout is used, we need to flush it here

            var form = element.controller('form');
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


    it('does not append validation messages, if forms are globally disabled', function ()
    {
        provider.extendConfig({
            globalFabFormDisable: true
        });

        var html = '<form>' +
            '<input ng-model="testInput" required>' +
            '</form>';

        element = $compile(html)(scope);
        scope.$digest();

        var form = element.controller('form');

        scope.testInput = null;
        scope.$digest();

        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer).toEqual({});
    });

    it('does append validation messages, if forms are globally disabled but the ng-fab-form attribute is provided', function ()
    {
        provider.extendConfig({
            globalFabFormDisable: true
        });

        var html = '<form ng-fab-form>' +
            '<input ng-model="testInput" required>' +
            '</form>';

        element = $compile(html)(scope);
        scope.$digest();

        var form = element.controller('form');

        scope.testInput = null;
        scope.$digest();

        var messageContainer = angular.element(element.children()[1]);
        expect(messageContainer).toBeDefined();
    });

    it('displays an asterisk for labels with proper for attribute for a required field, if config is set', function ()
    {
        provider.extendConfig({
            setAsteriskForRequiredLabel: true,
            asteriskStr: '*'
        });

        var html = '<form ng-fab-form-options="customFormOptions">' +
            '<input id="inpID" name="inpID" type="text" ng-model="testInput" required>' +
            '<div></div>' +
            '<label for="inpID">label</label>' +
            '</form>';

        // label needs to be appended to the dom to be found by
        // document.querySelector
        element = $compile(html)(scope);
        angular.element(document.body).append(element);

        scope.$digest();

        var label = document.querySelectorAll('label[for="inpID"]');
        label = angular.element(label[0]);
        expect(label.text()).toContain('*');
    });

    it('should work with real delayed form compilation (after input)', function (done)
    {
        var formEl,
            input,
            message,
            messageContainer,
            successMessage;

        provider.extendConfig({
            watchForFormCtrl: true
        });

        input = $compile('<input type="text" ng-model="testInput" required>')(scope);
        scope.$digest();

        setTimeout(function ()
        {
            formEl = $compile('<form></form>')(scope);
            formEl.append(input);

            scope.testInput = null;
            scope.$digest();


            messageContainer = angular.element(formEl.children()[1]);
            message = messageContainer.find('li');
            successMessage = messageContainer.find('div');
            expect(message.length).toBe(1);
            expect(message.attr('ng-message')).toBe('required');
            expect(message.text()).toBe('This field is required');
            expect(successMessage.hasClass('ng-hide')).toBe(true);
            done();
        }, 25);
    });

    it('displays an asterisk for labels directly before a required field, if config is set', function ()
    {
        provider.extendConfig({
            setAsteriskForRequiredLabel: true,
            asteriskStr: '*'
        });

        var html = '<form ng-fab-form-options="customFormOptions">' +
            '<label>label</label>' +
            '<input id="inpID" name="inpID" type="text" ng-model="testInput" required>' +
            '</form>';

        // needs to be appended to the dom to be found by
        // document.querySelector
        var element = $compile(html)(scope);
        angular.element(document.body).append(element);

        scope.$digest();

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

        var html = '<form ng-fab-form-options="customFormOptions">' +
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

        var label = document.querySelectorAll('label[for="inpID"]');
        label = angular.element(label[0]);

        expect(label.text().slice(-2 * asteriskVal.length)).not.toBe(asteriskVal + asteriskVal);
    });

    it('should be able to deactivate email-validation overwrite', function ()
    {
        provider.extendConfig({
            emailRegex: false
        });

        var element = $compile('<form>' +
            '<input type="email" ng-model="testInput" validation-msg-email ="some custom message" required>' +
            '</form>')(scope);
        scope.$digest();

        var form = element.controller('form');

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

        var html = '<form ng-fab-form-options="customFormOptions">' +
            '<input type="text" ng-model="username">' +
            '</form>';

        element = $compile(html)(scope);
        var form = element.controller('form');
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


    it('should create a custom validation message for the validation-msg-prefix-directive if it is not in the default template', function ()
    {
        // set default validations template, but dont include the message to test
        $templateCache.put('default-validation-msgs.html',
            '<div ng-messages="field.$error" class="validation">' +
            '<ul class="list-unstyled validation-errors" ng-show="field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)">' +
            '<li ng-message="somethingElse"></li>' +
            '</ul>' +
            '</div>'
        );

        var scope = $rootScope.$new();

        var html = '<form ng-fab-form-options="customFormOptions">' +
            '<input type="text" ng-model="weirdModel" validation-msg-weird="WEIRD_MSG">' +
            '</form>';

        element = $compile(html)(scope);
        var form = element.controller('form');
        var ngModel = form.weirdModel;

        ngModel.$validators.weird = function ()
        {
            return false;
        };
        scope.$digest();

        var messageContainer = angular.element(element.children()[1]);
        form.weirdModel.$setViewValue('SOMETHING');
        var message = messageContainer.find('li');
        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('weird');
        expect(message.text()).toBe('WEIRD_MSG');
    });
});
