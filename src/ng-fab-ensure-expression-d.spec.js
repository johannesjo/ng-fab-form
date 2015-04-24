describe('an input with ngFabEnsureExpression-directive', function ()
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


        element = $compile('<form name="ensureForm">' +
        '<input type="number" ng-fab-ensure-expression="test==1" ng-model="test" required/>{{test}}' +
        '</form>')(scope);
        $timeout.flush();
        scope.$digest();

        form = scope.ensureForm;
        messageContainer = angular.element(element);
    }));

    it('condition should pass', function ()
    {

        form.test.$setViewValue(1);
        expect(form.test.$valid).toBeTruthy();
    });

    it('Condition should fail', function ()
    {
        form.test.$setViewValue('invalid');

        expect(form.test.$valid).toBeFalsy();
    });

    it('Should show validation message message', function ()
    {

        form.test.$setViewValue(3);
        var message = messageContainer.find('li');

        expect(message.length).toBe(1);
        expect(message.attr('ng-message')).toBe('ngFabEnsureExpression');
        expect(message.text()).toBe('Not valid condition');


    });
    it('Should not show validation message message', function ()
    {

        form.test.$setViewValue(1);
        var message = messageContainer.find('li');

        expect(message.length).toBe(0);


    });

});



