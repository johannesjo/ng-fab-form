angular.module('exampleApp', [
    'ngFabForm',
    'ngMessages',
    'ngAnimate'
])
    .config(function ()
    {
        //bsAutoFormProvider.extendConfig({
        //    triggerOnBlur: false
        //});
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
