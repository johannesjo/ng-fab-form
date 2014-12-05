angular.module('ngFabForm').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('default-validation-msgs.html',
    "<div ng-messages=\"field.$error\"\n" +
    "     class=\"validation\">\n" +
    "    <ul class=\"list-unstyled validation-errors\"\n" +
    "        ng-show=\"field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)\">\n" +
    "        <li ng-message=\"required\">This field is required</li>\n" +
    "        <li ng-message=\"password\">This is not a valid password</li>\n" +
    "        <li ng-message=\"email\"> This is not a valid email-address</li>\n" +
    "        <li ng-message=\"pattern\">Your input does not match the requirements</li>\n" +
    "        <li ng-message=\"date\">This is not a valid date</li>\n" +
    "        <li ng-message=\"time\">This is not a valid time</li>\n" +
    "        <li ng-message=\"datetime\"> This is no valid datetime</li>\n" +
    "        <li ng-message=\"datetime-local\">This is no valid local datetime</li>\n" +
    "        <li ng-message=\"number\">This is no valid number</li>\n" +
    "        <li ng-message=\"color\">This no valid color</li>\n" +
    "        <li ng-message=\"range\">This is not a valid range</li>\n" +
    "        <li ng-message=\"month\">This is not a valid month</li>\n" +
    "        <li ng-message=\"url\">This is not a valid url</li>\n" +
    "        <li ng-message=\"file\">This not a valid file</li>\n" +
    "\n" +
    "        <li ng-message=\"minlength\">Your field should have at least {{ attrs.minlength }} characters</li>\n" +
    "        <li ng-message=\"maxlength\">Your field should have max {{ attrs.maxlength }} characters</li>\n" +
    "\n" +
    "        <li ng-if=\"attrs.type == 'time' \"\n" +
    "            ng-message=\"min\">The time provided should be no earlier than {{ attrs.min |date: 'HH:MM' }}\n" +
    "        </li>\n" +
    "        <li ng-message=\"max\"\n" +
    "            ng-if=\"attrs.type == 'time' \">The time should be no later than {{attrs.max |date: 'HH:MM'}}\n" +
    "        </li>\n" +
    "        <li ng-message=\"min\"\n" +
    "            ng-if=\"attrs.type == 'date' \">The date provided should be no earlier than then {{attrs.max\n" +
    "            |date:'dd.MM.yy'}}\n" +
    "        </li>\n" +
    "        <li ng-message=\"max\"\n" +
    "            ng-if=\"attrs.type == 'date' \">The time should be no later than {{attrs.max |date: 'dd.MM.yy'}}\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "    <div class=\"validation-success\"\n" +
    "         ng-show=\"field.$valid && !field.$invalid\">\n" +
    "    </div>\n" +
    "</div>\n"
  );

}]);
