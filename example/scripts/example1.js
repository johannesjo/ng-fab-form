angular.module('exampleApp', [
    'ngFabForm'
])
    .controller('exampleCtrl', function ($scope)
    {
        $scope.submit = function ()
        {
            alert('submit triggered');
        }
    });
