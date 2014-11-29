angular.module('exampleApp', [
    'bsAutoForm'
])
    .controller('exampleCtrl', function ($scope)
    {
        $scope.submit = function ()
        {
            alert('submit triggered');
        }
    });
