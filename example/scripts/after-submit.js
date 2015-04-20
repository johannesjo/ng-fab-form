angular.module('exampleApp')
    .controller('onBlurCtrl', function ($anchorScroll, $scope, ngFabForm)
    {
        $scope.submit = function ()
        {
            alert('Form submitted');
        };

        $scope.defaultFormOptions = ngFabForm.config;
        $scope.customFormOptions = {validationsTemplate: 'validation-examples/after-submit.html'};
    });
