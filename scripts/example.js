angular.module('exampleApp', [
    'ngFabForm',
    'ngMessages',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
        });
    })
    .controller('exampleCtrl', function ($scope, ngFabForm)
    {
        $scope.submit = function ()
        {
            console.log('CONTROLLER');
            alert('Form submitted');
        };

        $scope.formOpt = ngFabForm.config;
    });
