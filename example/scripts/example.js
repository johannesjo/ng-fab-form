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
    .run(function ($rootScope, $location, $anchorScroll)
    {
        $rootScope.scrollTo = function (id)
        {
            $location.hash(id);
            $anchorScroll();
        };
    })

    .controller('exampleCtrl', function ($anchorScroll, $scope, ngFabForm)
    {

        $scope.submit = function ()
        {
            alert('Form submitted');
        };
        $scope.resetForm = function ()
        {
            $scope.$broadcast('NG_FAB_FORM_RESET_ALL');
        };
        $scope.defaultFormOptions = ngFabForm.config;
        $scope.customFormOptions = angular.copy(ngFabForm.config);

        $scope.destroy = function ()
        {
            $scope.exampleUrl = null;
        };
        $scope.setExample = function (example)
        {
            $scope.exampleUrl = 'demos/' + example + '.html';
        };
    })


    .controller('onBlurCtrl', function ($anchorScroll, $scope, ngFabForm)
    {
        $scope.submit = function ()
        {
            alert('Form submitted');
        };
        $scope.defaultFormOptions = ngFabForm.config;
        $scope.customFormOptions = angular.copy(ngFabForm.config);
    });
