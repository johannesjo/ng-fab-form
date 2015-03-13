describe('an input with ngFabMatch-directive', function ()
{
    'use strict';

    var scope,
        $timeout,
        $rootScope,
        $compile,
        element,
        form,
        messageContainer;

    beforeEach(module('ngFabForm'));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_)
    {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        scope = $rootScope.$new();


        element = $compile('<form name="testForm">' +
        '<input type="password" ng-model="pw">' +
        '<input type="password" ng-model="pwRepeat" ng-fab-match="pw">' +
        '</form>')(scope);
        $timeout.flush();
        scope.$digest();

        form = scope.testForm;
        messageContainer = angular.element(element.children()[2]);
    }));

    it('should be valid if passwords match', function ()
    {
        form.pw.$setViewValue('somepw');
        form.pwRepeat.$setViewValue('somepw');
        expect(form.pwRepeat.$valid).toBeTruthy();
    });

    it('should be invalid if passwords don\'t match', function ()
    {
        form.pw.$setViewValue('somepw');
        form.pwRepeat.$setViewValue('somepwaa');
        expect(form.pwRepeat.$valid).toBeFalsy();
    });

    it('there should be a message if passwords values are entered and don\'t match', function ()
    {
        form.pw.$setViewValue('somepw');
        form.pwRepeat.$setViewValue('somepwaa');

        var message = messageContainer.find('li');

        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('ngFabMatch');
        expect(message.text()).toBe('The passwords should match');

        var successMessage = messageContainer.find('div');
        expect(successMessage.hasClass('ng-hide')).toBe(true);

        expect(form.pwRepeat.$valid).toBeFalsy();
    });

    it('there should be no message shown initially if passwords don`t match', function ()
    {
        form.pw.$setViewValue('somepw');
        var errorList = messageContainer.find('ul');
        expect(errorList.hasClass('ng-hide')).toBeTruthy();
        expect(form.pwRepeat.$valid).toBeFalsy();
    });
});



