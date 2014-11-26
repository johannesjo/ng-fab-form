angular.module('ngFabForm')
    .service('FormErrorMsgs', function ()
    {
        'use strict';
        return {
            email: 'Emailaaa',
            formNotFilled: 'Form not filled'
        };
    });


angular.module('ngFabForm')
    .provider('ngFabFormConfig', function ()
    {
        var _showSuccess, _trigger;
        _showSuccess = false;
        _trigger = 'blur';
        this.showSuccess = function (showSuccess)
        {
            return _showSuccess = showSuccess;
        };
        this.trigger = function (trigger)
        {
            return _trigger = trigger;
        };
        this.$get = function ()
        {
            return {
                showSuccess: _showSuccess,
                trigger: _trigger
            };
        };
    });
