[![Stories in Ready](https://badge.waffle.io/johannesjo/ng-fab-form.svg?label=ready&title=Ready)](http://waffle.io/johannesjo/ng-fab-form)
[![Stories in progress](https://badge.waffle.io/johannesjo/ng-fab-form.svg?label=in%20progress&title=In%20Progress)](http://waffle.io/johannesjo/ng-fab-form)
[![Build Status](https://travis-ci.org/johannesjo/ng-fab-form.svg?branch=master)](https://travis-ci.org/johannesjo/ng-fab-form?branch=master)
[![Coverage Status](https://coveralls.io/repos/johannesjo/ng-fab-form/badge.svg?branch=master)](https://coveralls.io/r/johannesjo/ng-fab-form?branch=master)

ng-fab-form
===========

*Convenient forms for Angular with no extra markup? Fabulous!*

AngularJS forms are pretty nice. But if you have worked with angular for a while, you'll find that the out of the box mechanics like the instant validation are far from perfect from the common users perspective. Furthermore you probably catch yourself declaring (and sometimes forgetting) the same stuff on and on again like giving a `novalidate` attribute, preventing submission for invalid forms or declaring a proper name attribute and worst of all: setting up validation messages again and again.

It is understandable why the angular-developers want to give us the freedom, of doing all this stuff in the most flexible manner, but most of the time you want to keep things consistent and not handle every form differently.`ng-fab-form` tries to help you with this with a reasonable default but highly configurable behavior for your forms.

[Bug-reports or feature request](https://github.com/johannesjo/ng-fab-form/issues) as well as any other kind of **feedback is highly welcome!**

## getting started

Install it via bower
```
bower install ng-fab-form -S
```
and add `ngFabForm` as dependency in your main module:
```
angular.module('yourApp',[
  'ngFabForm'
]);
```
That is all you need to do to get started.

### features

Have a look at the [DEMO](http://johannesjo.github.io/ng-fab-form/demos.html) or the [plunkr](http://plnkr.co/edit/8vCSPw?p=preview)!

Keep in mind that if you don't like one of the functionalities, ng-fab-form is build with customization in mind. **It's possible to disable almost any feature easily in your app configuration**.

**List of Features**:

* Global (or invidivual) **configurable validation messages** (using `ng-messages`, [see](https://docs.angularjs.org/api/ngMessages/directive/ngMessages)) to any element  with a validation directive on it like `required`, `ng-required`, `ng-pattern`, `ng-minlength` and even new ones added.
* **Prevents submission of invalid forms**
* Completely **disableable forms** via a `disable-form` attribute
* **Show field validations after submit attempt**  
* **Prevent double submissions** of forms when double clicked via a configurable delay
* **Total configurability**: You not only can change or turn of any default setting you don't like, but the validation messages template gives you **complete flexibility on when and how your error messages appear**.
* **Works with any custom validation directive** you have running in your project (as long as they're correctly working with the ngModel-Controller)
* Provides you with **resettable forms** via the `$resetForm` method
* Compatibility with most other form modules
* Compatibility with the most popular **translation modules**
* Provides an api to add **custom validators**
* Adds a more reasonable email-validation
* Adds `name` attributes based on ng-model, if none is set
* Adds the `novalidate` attribute to forms
* `ngFabMatch`-directive (e.g. for checking a repeated password)
* Has support for **async-validators** and adds a nice interface to add new ones
* Scrolls to and focuses the first form element with an error, if the submission fails


**Useful companions**
* [**angular-promise-buttons**](https://github.com/johannesjo/angular-promise-buttons) the most easy to use loading spinner buttons out there
* [**angular-auto-forms**](https://github.com/johannesjo/angular-auto-forms) quick and easy bootstrap forms


## why choose ng-fab-form over another form helper module?

There are a lot of [form builders and other modules with the intention of simplifying form handling](https://github.com/search?o=desc&q=angular+form&s=stars&type=Repositories&utf8=%E2%9C%93) out there. Why choose `ng-fab-form` then? First of all you likely will not have to choose one or the other as it should be compatible with every module using `ngModel` for validations and because you will probably be able to deactivate any conflicting functionalities (be sure to [report incompatibilties](https://github.com/johannesjo/ng-fab-form/issues)).

The reason why `ng-fab-form` was build, is that the modules I tried either take only a small part of the repetitiveness out of your job or they take a framework-like approach and you're becoming very dependent on them, the markup they require and spit out, the functionalities they introduce and probably more important, those they don't introduce and those who hinder other features. This is not necessarily a bad thing and they might greatly improve your productivity, but the (non angular-canon) restrictions and rules they introduce make them too limited for some projects and less of a universal form tool, which can be used again and again.

This is why `ng-fab-form` focuses on the basic angular functions and tries to extend them application-wide, while always giving you the option to throw out what doesn't fit in. Worst case scenario: You completely remove `ng-fab-form` because you don't like it and then you're back to standard angular, with probably almost no effort spend, almost no time wasted.


## manual installation and dependencies

Grab the minified [ng-fab-form file](https://github.com/johannesjo/ng-fab-form/blob/master/dist/ng-fab-form.min.js) from the dist folder. You also need to install [ng-messags](https://docs.angularjs.org/api/ngMessages/directive/ngMessages) which is the only required dependency.


## configuring default form options

Currently the configuration object of ng-fab-forms looks like this:
```
// validation template-url/templateId
// to disable validation completely set it false
validationsTemplate: 'default-validation-msgs.html',

// prevent submission of invalid forms
preventInvalidSubmit: true,

// prevent double clicks
preventDoubleSubmit: true,

// double click delay duration
preventDoubleSubmitTimeoutLength: 1000,

// show validation-messages on failed submit
setFormDirtyOnSubmit: true,

// autofocus first error-element
scrollToAndFocusFirstErrorOnSubmit: true,

// set in ms
scrollAnimationTime: 500,

// fixed offset for scroll to element
scrollOffset: -100,

// ***************************************************
// The following options are not configurable via the
// ngFabFormOptions-directive as they need to be
// available during the $compile-phase
// ***************************************************

// option to disable forms by wrapping them in a disabled <fieldset> element
disabledForms: true,

// option to disable ng-fab-form globally and use it only manually
// via the ng-fab-form directive
globalFabFormDisable: false,

// add noovalidate to forms
setNovalidate: true,

// set form-element names based on ngModel if not set
// NOTE: not changeable via ngFabFormOptions-directive as it needs to
// available during the $compile-phase
// NOTE2: name-attributes are required to be set here
// or manually for the validations to work
setNamesByNgModel: true,

// add asterisk to required fields; only
// works when the forms are NOT globally disabled
setAsteriskForRequiredLabel: false,

// asterisk string to be added if enabled
// requires setAsteriskForRequiredLabel-option set to true
asteriskStr: '*',

// the validation message prefix, results for the default state
// `validation-msg-required` or `validation-msg-your-custom-validation`
validationMsgPrefix: 'validationMsg',

// default email-regex, set to false to deactivate overwrite
emailRegex: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,

// in very rare cases (e.g. for some form-builders) your form
// controller might not be ready before your model-controllers are,
// for those instances set this option to true
watchForFormCtrl: false,

// name of the change event, change if there are conflicts
formChangeEvent: 'NG_FAB_FORM_OPTIONS_CHANGED'

// message template, used to create messages for custom validation messages
// created by validationMsgPrefix when there is no default ng-message for
// the validator in the main template. This allows you to one time append
// messages when validationMSgPrefix(+validator+) is set
createMessageElTplFn: function (sanitizedKey, attr)
{
    return '<li ng-message="' + sanitizedKey + '">' + attr + '</li>';
}
```
You can easily extend those configurations like this:
```javascript
angular.module('exampleApp', [
    'ngFabForm'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            scrollToAndFocusFirstErrorOnSubmit: false,
            setNovalidate: false
        });
    });
```

## multiple form configurations via `ng-fab-form-options`
`validationsTemplate`, `preventInvalidSubmit`, `preventDoubleSubmit`, `preventDoubleSubmitTimeoutLength`, `setFormDirtyOnSubmit`, `scrollToAndFocusFirstErrorOnSubmit`, `scrollAnimationTime` and `scrollOffset` can also be changed in real-time from your controllers or directives:
```javascript
angular.module('exampleApp', [
'ngFabForm'
])
.controller('exampleCtrl', function ($scope, ngFabForm)
{
  $scope.customFormOptions = {
    validationsTemplate: 'your-tpl.html',
    preventInvalidSubmit: false,
    preventDoubleSubmit: false,
    setFormDirtyOnSubmit: true,
    scrollToAndFocusFirstErrorOnSubmit: true,
    scrollAnimationTime: 900,
    scrollOffset: -100,
  };
});
```

And in your template:
```html
<form ng-fab-form-options="customFormOptions">...</form>
```

## disable form completly
```html
<form disable-form="{{booeleanVar}}">...</form>
```

## check for matching passwords via ngFabMatch-directive
```html
<form>
  <input type="password" ng-model="realPassword" required>
  <input type="password" ng-model="pwRepeat" ng-fab-match="realPassword" required>
</form>
```

## Validate by expression via ngFabEnsureExpression-directive
```html
<form>
  <input type="text" ng-fab-ensure-expression="testModel=='test'" ng-model="testModel" required>
</form>
```

## special validations for special cases (e.g. ng-pattern)

Sometimes you might want to have another text for a specific context. Special validation-messages like this are easily added like this:
```html
<input type="text"
  ng-model="my-model"
  required
  ng-pattern="/abcdefg/"
  validation-msg-pattern="Not abcdefg :(">
```

## default validations and creating your own validation template

`ng-fab-form` comes with a reasonable default validation template, which is used for every form element with `ng-model` set. But you can easily create your own if you don't like the either the messages or the markup! In your own template you can use any attribute and directive, as you would with vanilla angular. In addition the input-element attributes are available for you convenience, too!

This is what the default validation template looks like:
```html
<!-- Default Validation Template -->
<div class="validation"
     ng-show="attrs.required===''|| attrs.required">
     <!-- Show errors for invalid fields, when it has been either focused,
      has been changed or the user tried to submit the form without success
      (requires the setDirtyOnSubmit-option to be set-->
    <ul class="list-unstyled validation-errors"
        ng-show="field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)"
        ng-messages="field.$error">
        <li ng-message="required">This field is required</li>
        <li ng-message="password">Please enter a valid password</li>
        <li ng-message="email">Please enter a valid e-mail</li>
        <li ng-message="pattern">Invalid input format</li>
        <li ng-message="date">Please enter a valid date</li>
        <li ng-message="time">Please enter a valid time</li>
        <li ng-message="datetime">Please enter a valid date and time</li>
        <li ng-message="datetime-local">Please enter a valid date and time</li>
        <li ng-message="number">This field must be numeric</li>
        <li ng-message="color">Please enter a valid color</li>
        <li ng-message="range">Please enter a valid range</li>
        <li ng-message="month">Please enter a valid month</li>
        <li ng-message="url">Please enter a valid URL</li>
        <li ng-message="file">Invalid file</li>

        <!-- ng-fab-form provides you with access to the
        input-element-attributes, allowing you to display their values
        inside of the message-->
        <li ng-message="minlength">Please use at least {{ attrs.minlength }} characters</li>
        <li ng-message="maxlength">Please do not exceed {{ attrs.maxlength }} characters</li>

        <li ng-if="attrs.type === 'time' "
            ng-message="min">The time provided should be no earlier than {{ attrs.min |date: 'HH:MM' }}
        </li>
        <li ng-message="ngFabMatch">The {{ attrs.type ==='password'? 'passwords' : 'values' }} should match</li>


        <!-- you can use ng-if or ng-show for more advanced
        error messages -->
        <li ng-if="attrs.type === 'time' "
            ng-message="min">The time provided should after {{ attrs.min |date: 'HH:MM' }}
        </li>
        <li ng-message="max"
            ng-if="attrs.type === 'time' ">The time provided should be before {{attrs.max |date: 'HH:MM'}}
        </li>
        <li ng-message="min"
            ng-if="attrs.type === 'date' ">The date provided should be after {{attrs.min
          |date:'dd.MM.yy'}}
          </li>
        <li ng-message="max"
            ng-if="attrs.type === 'date' ">The date provided should be before {{attrs.max |date: 'dd.MM.yy'}}
        </li>
        <li ng-message="min"
            ng-if="attrs.type === 'number' ">The number provided should be at least {{attrs.min}}
          </li>
        <li ng-message="max"
            ng-if="attrs.type === 'number' ">The number provided should be at max {{attrs.max}}
        </li>
    </ul>
    <!-- It is also possible to show a success element
    using the standard form syntax -->
    <div class="validation-success"
         ng-show="field.$valid && !field.$invalid">
    </div>
</div>
```

To load you own validations simply set the template url in your configuration:
```javascript
angular.module('exampleApp', [
    'ngFabForm'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            validationsTemplate : 'path/to/your-fabulous-validation-template.html'
        });
    });
```

#### create and share
You can use this [plunkr as base for your fabulous creation](http://plnkr.co/edit/wVW8ih?p=info)! Think you created something useful? Then share it!!! Either provide a pull-request or leave a comment on the [projects public page](http://johannesjo.github.io/ng-fab-form/).

If you provide a pull-reqest, please use a feature-branch. The commit should usually contain two files: A html template and a scss-file.


## resettable forms
There are two ways to reset your form. The first one requires you to use the 'contallerAs'-syntax to access the form controller: 
```html
<div ng-controller="myCtrl as ctrl">
  <form name="ctrl.myForm">
    <input type="text"
      ng-model="my-model"
      required>
    <button type="button"
      ng-click="resetForm()">
      Reset the form!
    </button>
  </form>
</div>
```

```javascript
myMod.controller('myCtrl', function(){
    var vm = this;
    vm.resetForm = function(){
        // this resets the form without clearing the inputs
        vm.myForm.$resetForm();
        
        // this resets the form with setting all ng-model 
        // values in it to undefined
        vm.myForm.$resetForm(true);
    }
});
```

The second one uses the 'ng-fab-reset-form-on' directive:
```html
<form>
  <input type="text"
    ng-model="my-model"
    required>
  <button type="button"
    ng-fab-reset-form-on>
    Reset the form!
  </button>
</form>
```
As per default the button (or any other element) is triggered on click. If you need something else you can provide those by setting a value. If you need multiple events, separate them by a space:
```html
<button type="button"
  ng-fab-reset-form-on="touchstart my-custom-event-on-this-element">
  Reset the form!
</button>
```
Another default is to reset the 'ngModel' value of all form inputs to 'undefined'. You can prevent this behaviour by using the `do-not-clear-inputs` attribute:
```html
<button type="button"
  ng-fab-reset-form-on
  do-not-clear-inputs>
  Reset the form, but leave the inputs be!
</button>
```


## advanced configurations
### adjust insertion function of validation messages
You can edit where and how the messages are inserted in relation to their corresponding form-element:

```javascript
angular.module('exampleApp', [
    'ngFabForm',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        var customInsertFn = function (compiledAlert, el, attrs)
            {
                // insert after or after parent if checkbox or radio
                if (attrs.type === 'checkbox' || attrs.type === 'radio') {
                    el.parent().after(compiledAlert);
                } else {
                    el.after(compiledAlert);
                }
            };
        ngFabFormProvider.setInsertErrorTplFn(customInsertFn);
    });

```
### use a custom scroll-to handler
You can change the scroll animation-handler to one of your liking:

```javascript
angular.module('exampleApp', [
    'ngFabForm',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        var customScrollToFn = function (targetElement, duration, scrollOffset)
            {
               targetElement.scrollIntoView(true);
               targetElement.focus();
            };
        ngFabFormProvider.setScrollToFn(customScrollToFn);
    });

```
A good starting point for you might be the [default function which can be found inside of the `ngFabFormProvider`](https://github.com/johannesjo/ng-fab-form/blob/master/src/ng-fab-form-p.js).

### adding your own validators (or overwriting existing ones)
The default validations for email, url and number fields are not always what you want. ng-fab-form provides you with an api to add your own or to overwrite the existing ones:

```javascript
angular.module('exampleApp', [
'ngFabForm',
])
.config(function (ngFabFormProvider)
{
  var customValidatorFn = function (ngModelCtrl, attrs)
  {
    var regex = /www.only-awesome-urls.tu/;
    if (attrs.type === 'url') {
      ngModelCtrl.$validators.url = function (value)
      {
        return ngModelCtrl.$isEmpty(value) || regex.test(value);
      };
    }
  };
  ngFabFormProvider.setCustomValidatorsFn(customValidatorFn);
});

```

### deactivate ng-fab-form globally and only use it via the `ng-fab-form`-directive
If needed, you can configure `ng-fab-form` to be only used by the `ng-fab-form`-directive.
```javascript
angular.module('exampleApp', [
    'ngFabForm'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            globalFabFormDisable: true
        });
    });
```
Then in your template, you just add `ng-fab-form` to the forms in question:
```html
<form ng-fab-form></form>
``` 
There is a drawback: This won't work together with the setAsteriskForLabel-option.


## ❤ contribute ❤
I'm happy for any [issue or feature request](https://github.com/johannesjo/ng-fab-form/issues), you might encounter or want to have. Even a one liner is better, than no feedback at all. Pull requests are also highly welcome. Just fork the repository, clone it and run `grunt serve` for development. Another important factor is the number of developers using and thus testing `ng-fab-form`. Tell your fellow programmers, [say that you use it on ng-modules](http://ngmodules.org/modules/ng-fab-form), tweet or even blog about it.

`ng-fab-form` is published under the [The GNU Lesser General Public License V2.1](https://github.com/johannesjo/ng-fab-form/blob/master/LICENSE).

## (possible) fabulous future features
* [your feature request](https://github.com/johannesjo/ng-fab-form/issues)!
