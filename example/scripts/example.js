angular.module('exampleApp', [
    'ngFabForm',
    'ngMessages',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        //bsAutoFormProvider.extendConfig({
        //    triggerOnBlur: false
        //});
    })
    .controller('exampleCtrl', function ($scope, bsAutoForm)
    {
        $scope.submit = function ()
        {
            console.log('CONTROLLER');
            alert('Form submitted');
        };

        $scope.formOpt = bsAutoForm.config;
    });
