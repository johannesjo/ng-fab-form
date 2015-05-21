describe('a form with nested ng-form', function ()
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


    it('should not throw an error', function ()
    {
        $compile('<form><ng-form><input type="text" ng-model="test"></ng-form></form>')(scope);
        scope.$digest();
        $timeout.flush();
    });
});
