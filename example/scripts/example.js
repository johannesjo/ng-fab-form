angular.module('exampleApp', [
    'ngFabForm',
    'ngMessages',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            //setAsteriskForRequiredLabel: true
        });
    })
    .controller('exampleCtrl', function ($scope, ngFabForm, $timeout)
    {
        $scope.submit = function ()
        {
            alert('Form submitted');
        };
        $scope.defaultFormOptions = ngFabForm.config;
        $scope.customFormOptions = {
            validationsTemplate: 'default-validation-msgs.html',
            preventInvalidSubmit: true,
            preventDoubleSubmit: false,
            preventDoubleSubmitTimeoutLength: 1000,
            setFormDirtyOnSubmit: true,
            scrollToAndFocusFirstErrorOnSubmit: true,
            scrollAnimationTime: 'smooth',
            scrollOffset: -300,

            // not configurable as they need be available
            // during the $compile-phase
            disabledForms: true,
            setNovalidate: true,
            setNamesByNgModel: true,
            asteriskStr: false
        };

        $scope.validationMessages = ngFabForm.validationMessages;
        $scope.advancedValidations = ngFabForm.advancedValidations;
    });
