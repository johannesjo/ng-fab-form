angular.module('exampleApp', [
    'bsAutoForm',
    'ngMessages'
])
    .config(function (bsAutoFormProvider)
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
