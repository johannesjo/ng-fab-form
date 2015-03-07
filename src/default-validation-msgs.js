angular.module('ngFabForm').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('default-validation-msgs.html',
    "<div ng-messages=\"field.$error\"\n" +
    "     class=\"validation\">\n" +
    "    <ul class=\"list-unstyled validation-errors\"\n" +
    "        ng-show=\"field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)\">\n" +
    "        <li ng-message=\"required\">This field is required</li>\n" +
    "        <li ng-message=\"password\">Please enter a valid password</li>\n" +
    "        <li ng-message=\"email\">Please enter a valid e-mail</li>\n" +
    "        <li ng-message=\"pattern\">Invalid input format</li>\n" +
    "        <li ng-message=\"date\">Please enter a valid date</li>\n" +
    "        <li ng-message=\"time\">Please enter a valid time</li>\n" +
    "        <li ng-message=\"datetime\">Please enter a valid date and time</li>\n" +
    "        <li ng-message=\"datetime-local\">Please enter a valid date and time</li>\n" +
    "        <li ng-message=\"number\">This field must be numeric</li>\n" +
    "        <li ng-message=\"color\">Please enter a valid color</li>\n" +
    "        <li ng-message=\"range\">Please enter a valid range</li>\n" +
    "        <li ng-message=\"month\">Please enter a valid month</li>\n" +
    "        <li ng-message=\"url\">Please enter a valid URL</li>\n" +
    "        <li ng-message=\"file\">Invalid file</li>\n" +
    "\n" +
    "        <li ng-message=\"minlength\">Please use at least {{ attrs.minlength }} characters</li>\n" +
    "        <li ng-message=\"maxlength\">Please do not exceed {{ attrs.maxlength }} characters</li>\n" +
    "\n" +
    "        <li ng-message=\"match\">The {{ attrs.type ==='password'? 'passwords' : 'values' }} should match</li>\n" +
    "\n" +
    "        <li ng-if=\"attrs.type == 'time' \"\n" +
    "            ng-message=\"min\">The time provided should after {{ attrs.min |date: 'HH:MM' }}\n" +
    "        </li>\n" +
    "        <li ng-message=\"max\"\n" +
    "            ng-if=\"attrs.type == 'time' \">The time provided should be before {{attrs.max |date: 'HH:MM'}}\n" +
    "        </li>\n" +
    "        <li ng-message=\"min\"\n" +
    "            ng-if=\"attrs.type == 'date' \">The date provided should be after {{attrs.min\n" +
    "            |date:'dd.MM.yy'}}\n" +
    "        </li>\n" +
    "        <li ng-message=\"max\"\n" +
    "            ng-if=\"attrs.type == 'date' \">The date provided should be before {{attrs.max |date: 'dd.MM.yy'}}\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <div class=\"validation-success\"\n" +
    "         ng-show=\"field.$valid && !field.$invalid\">\n" +
    "    </div>\n" +
    "</div>\n"
  );

}]);
