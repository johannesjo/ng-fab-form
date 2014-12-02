angular.module('exampleApp', [
    'ngFabForm',
    'ngMessages',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            setAsteriskForRequiredLabel: true
        });
    })
    .controller('exampleCtrl', function ($scope, ngFabForm)
    {
        $scope.submit = function ()
        {
            alert('Form submitted');
        };
        $scope.formOpt = ngFabForm.config;
        $scope.validationMessages = ngFabForm.validationMessages;
        $scope.advancedValidations = ngFabForm.advancedValidations;
    });
