ng-fab-form
===========
*Fabulous Forms for AngularJS*


AngularJS forms are pretty nice. But if you have worked with angular for a while, you'll find that the out-of-the-box-mechanics like the instant validation are not far from perfect. Furthermore you catch yourself declaring the same stuff on and on again like giving a `novalidate` attribute and preventing for submission for invalid forms. The the most repitive part by far is the validation. I understand why the angular-developers want to give us the freedom, of doing this stuff in the most flexible manner, but I personally like to keep things consistent, which is hard with how forms work out of the box.

There are also a lot of form builders (like formly, etc.) out there. But you have to implement quite a different markup, to make those work. ng-fab-form tries solve all of those issues without requiring you to change anything. Just set your forms up as usual and let ng-fab-form do the rest for you. 


getting started
===============
Install it via bower:
```
bower install ng-fab-form angular-messages -S
```
And in your main module:
```
angular.module('yourApp',[
  'ngFabForm',
  'ngMessages'
]);
```
Thats all you need to do, to get started.

features
===============
Have a look at the [DEMO](http://johannesjo.github.io/ng-fab-form#demo)!

Keep in mind that if you don't like one of the functionalities, ng-fab-form is build with customization in mind. **It's possible to disable almost any feature easily in your app configuration**.

It automatically:

* append configurable validation messages (using `ng-messages`) to any element  with a validation directive on it like `required`, `ng-required`, `ng-pattern`, `ng-minlength` and so on
* adds a validation directive in case you have an exception to the rule
* adds `name` attributes based on ng-model
* adds a `novalidate` attribute to forms
* prevents submission of invalid forms
* adds an option to disable a form completly via a `disable-form` attribute
* adds a trigger to show field validations after the user tries to submmit
* prevents double submissions of forms when double clicked via a configurable delay
* scrolls to and focuesses the first form element with an error, if the submission fails
* tries to set an asterisk to the corresponding label, if `required` or `ng-required` is set

configuring options
===================
Currently the configuration object of ng-fab-forms looks like this.
```
showErrorsOn: [
    '$touched', // if element was focussed 
    '$dirty' // if element was edited
],

// add noovalidate to forms
setNovalidate: true, 

// add asterisk to required fields
setAsteriskForRequiredLabel: false, 

// asterisk string to be added if enabled
asteriskStr: '*', 

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

// set either to fixed duration or to 'smooth'
// 'smooth' means that the duration is calculated, 
// based on the distance to scroll (the more the faster it scrolls)
scrollAnimationTime: 'smooth',

// fixed offset for scroll to elment
scrollOffset: -100,

// option to disable forms by wrapping them in a disabled <fieldset> elment
disabledForms: true,

// event-name-space, usually you won't need to change anything here
eventNameSpace: 'ngFabForm',

// the validation message prefix, results for the default state
// `validation-msg-required` or `validation-msg-your-custom-validation`
validationMsgPrefix: 'validationMsg'
```
You can easily extend those configurations like this
```javascript
angular.module('exampleApp', [
    'ngFabForm',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            scrollToAndFocusFirstErrorOnSubmit: false,
            setNovalidate: false
        });
    });

```

configuring default messages
============================
Like the options, the default messages are an easily configurable 
```javascript
angular.module('exampleApp', [
    'ngFabForm',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendValidationMessages({
            required: 'This field is required!!!',
            maxlength: 'Your input is way too long',
            minlength: 'Your input is just short',
            email: 'This is not a gmail-address'
        });
    });

```

special validations (e.g. ng-pattern)
================================
For specific cases you might want to have another text for a specifc context.
```html
<input type="text"
       mg-model="my-model"
       ng-pattern="/abcdefg/"
       vallidation-msg-pattern="Not abcdefg :(">
```

advanced configuration
====================
Furthermore you can adjust the validation template to your needs.

```javascript
angular.module('exampleApp', [
    'ngFabForm',
    'ngAnimate'
])
    .config(function (ngFabFormProvider)
    {
        var customTplFn = function (ngShowCondition, formName, elName, messages)
            {
                var msgs = '';
                angular.forEach(messages, function (msg, key)
                {
                    msgs += '<li ng-message="' + key + '">' + msg + '</li>';
                });

                return '<div ng-show="' + ngShowCondition + '"' +
                    'ng-messages="' + formName + '.' + elName + '.$error" ' +
                    'class="help-block with-errors">' +
                    '<ul class ="list-unstyled">' +
                    msgs +
                    '</ul></div>';
            };
        ngFabFormProvider.setWrapperTplFunction(customTplFn);
    });
    
```

And edit where and how the messages are inserted in relation to their corresponding form-element:

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






