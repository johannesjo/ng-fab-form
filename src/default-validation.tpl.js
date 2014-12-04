/* jshint quotmark: false */

angular.module('ngFabForm')
    .run(function ($templateCache, ngFabForm)
    {
        'use strict';

        var tpl = "";
        tpl += "<div ng-messages=\"field.$error\"";
        tpl += "     class=\"help-block\">";
        tpl += "    <ul class=\"list-unstyled\"";
        tpl += "        ng-show=\"field.$invalid && (field.$touched || field.$dirty)\">";
        tpl += "        <li ng-message=\"required\">You did not enter a field<\/li>";
        tpl += "        <li ng-message=\"password\">This is not a valid password<\/li>";
        tpl += "        <li ng-message=\"email\"> This is not a valid email-address<\/li>";
        tpl += "        <li ng-message=\"pattern\">pattern Your input does not match the requirements<\/li>";
        tpl += "        <li ng-message=\"date\">This is not a valid date<\/li>";
        tpl += "        <li ng-message=\"time\">This is not a valid time<\/li>";
        tpl += "        <li ng-message=\"datetime\"> This is no valid datetime<\/li>";
        tpl += "        <li ng-message=\"datetime-local\">This is no valid local datetime<\/li>";
        tpl += "        <li ng-message=\"number\">This is no valid number<\/li>";
        tpl += "        <li ng-message=\"color\">This no valid color<\/li>";
        tpl += "        <li ng-message=\"range\">This is not a valid range<\/li>";
        tpl += "        <li ng-message=\"month\">This is not a valid month<\/li>";
        tpl += "        <li ng-message=\"url\">This is not a valid url<\/li>";
        tpl += "        <li ng-message=\"file\">This not a valid file<\/li>";
        tpl += "        <li ng-message=\"minlength\">Your field should have at least {{ attrs.minlength }} characters<\/li>";
        tpl += "        <li ng-message=\"maxlength\">Your field should have max {{ attrs.maxlength }} characters<\/li>";
        tpl += "        <li ng-if=\"attrs.type == 'time' \"";
        tpl += "            ng-message=\"min\">The time provided should be no earlier than {{ attrs.min |date: 'HH:MM' }}";
        tpl += "        <\/li>";
        tpl += "        <li ng-message=\"max\"";
        tpl += "            ng-if=\"attrs.type == 'time' \">The time should be no later than {{attrs.max |date: 'HH:MM'}}";
        tpl += "        <\/li>";
        tpl += "        <li ng-message=\"min\"";
        tpl += "            ng-if=\"attrs.type == 'date' \">The date provided should be no earlier than then {{attrs.max";
        tpl += "            |date:'dd.MM.yy'}}";
        tpl += "        <\/li>";
        tpl += "        <li ng-message=\"max\"";
        tpl += "            ng-if=\"attrs.type == 'date' \">The time should be no later than {{attrs.max |date: 'dd.MM.yy'}}";
        tpl += "        <\/li>";
        tpl += "    <\/ul>";
        tpl += "<\/div>";
        tpl += "";

        $templateCache.put(ngFabForm.config.template, tpl);
    });
