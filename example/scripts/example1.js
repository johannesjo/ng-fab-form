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
    .controller('exampleCtrl', function ($scope)
    {
        $scope.submit = function ()
        {
            alert('submit triggered');
        }
    });
