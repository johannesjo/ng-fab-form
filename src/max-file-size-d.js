angular.module('ngFabForm')
    .directive('maxFileSize', function (maxUploadSizeInByte)
    {
        'use strict';

        var config = {
            maxUploadSizeInByte: maxUploadSizeInByte,
            validationKey: 'maxFileSize'
        };

        return {
            restrict: 'A',
            require: '?ngModel',
            scope: {
                'ngModel': '=',
                'maxFileSize': '@'
            },
            link: function (scope, el, attrs, ngModel)
            {
                var maxFileSize;

                // only assign once
                if (!scope.maxFileSize || parseFloat(scope.maxFileSize) > 0) {
                    maxFileSize = config.maxUploadSizeInByte;
                } else {
                    maxFileSize = scope.maxFileSize;
                }

                scope.$watch('ngModel', function (newVal)
                {
                    if (newVal instanceof Array) {
                        ngModel.$setViewValue(newVal);

                        // if one of the selected files is bigger than allowed
                        // set validation-status to false
                        var isValid = true;
                        for (var i = 0; i < scope.ngModel.length; i++) {
                            var file = scope.ngModel[i];
                            if (file.size > maxFileSize) {
                                isValid = false;
                                break;
                            }
                        }
                        ngModel.$setValidity(config.validationKey, isValid);
                    } else {
                        ngModel.$setValidity(config.validationKey, true);
                    }

                    // set third $watch param to true for object equality
                }, true);
            }
        };
    });
