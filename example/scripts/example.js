angular.module('exampleApp', [
    'ngFabForm',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            //setAsteriskForRequiredLabel: true
        });
    })
    .controller('exampleCtrl', function ($scope, ngFabForm)
    {
        $scope.submit = function ()
        {
            alert('Form submitted');
        };
        $scope.defaultFormOptions = ngFabForm.config;
        $scope.customFormOptions = angular.copy(ngFabForm.config);
    });
