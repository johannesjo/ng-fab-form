ng-fab-form
===========

*Convenient forms for Angular with no extra markup? Fabulous!*

AngularJS forms are pretty nice. But if you have worked with angular for a while, you'll find that the out of the box mechanics like the instant validation are far from perfect from the common users perspective. Furthermore you probably catch yourself declaring (and sometimes forgetting) the same stuff on and on again like giving a `novalidate` attribute, preventing submission for invalid forms or declaring a proper name attribute. 

The most repitive part by far is validation. I understand why the angular-developers want to give us the freedom, of doing this stuff in the most flexible manner, but I personally like to keep things consistent, which is hard with how forms work out of the box.`ng-fab-form` tries solve all of those issues without requiring you to change anything. Just set your forms up as usual and let `ng-fab-form` do the rest for you. 

[Bug-reports or feature request](https://github.com/johannesjo/ng-fab-form/issues) as well as any other kind of **feedback is highly welcome!**

## getting started

Install it via bower
```
bower install ng-fab-form angular-messages -S
```
and add `ngFabForm` and `ngMessages` as dependency in your main module:
```
angular.module('yourApp',[
  'ngFabForm',
  'ngMessages'
]);
```
That is all you need to do to get started.

### features

Have a look at the [DEMO](http://johannesjo.github.io/ng-fab-form#demo) or the [plunkr](http://plnkr.co/edit/EvJErlndub8JG2ktKeoZ?p=preview) or another [plunkr with nicer styles](http://embed.plnkr.co/3GUMzQC4hcxBJnQUZkGn/preview)!

Keep in mind that if you don't like one of the functionalities, ng-fab-form is build with customization in mind. **It's possible to disable almost any feature easily in your app configuration**.

It automatically:

* appends configurable validation messages (using `ng-messages`, [see](https://docs.angularjs.org/api/ngMessages/directive/ngMessages)) to any element  with a validation directive on it like `required`, `ng-required`, `ng-pattern`, `ng-minlength` and even new ones added
* adds a validation directive in case you have an exception to the rule
* adds `name` attributes based on ng-model, if none is set
* adds a `novalidate` attribute to forms
* prevents submission of invalid forms
* adds an option to disable a form completly via a `disable-form` attribute
* adds a trigger to show field validations after the user tries to submmit
* prevents double submissions of forms when double clicked via a configurable delay
* scrolls to and focusses the first form element with an error, if the submission fails
* tries to set an asterisk to the corresponding label, if `required` or `ng-required` is set
* should work with any custom validation directive you have running in your project (as long as they're correctly working with the ngModel-Controller)


## why choose ng-fab-form over another form helper module?

There are a lot of [form builders and other modules with the intention of simplyfing form handling](https://github.com/search?o=desc&q=angular+form&s=stars&type=Repositories&utf8=%E2%9C%93) out there. Why choose `ng-fab-form` then? First of all you likely will not have to choose one or the other as it should be compatible with every module using ngModel for validations and because you will probably be able to deactivate any conflicting functionalities (be sure to [report incompatibilties](https://github.com/johannesjo/ng-fab-form/issues)). 

The reason why `ng-fab-form` was build, is that the modules I tried either take only a small part of the reptiveness out of your job or they take a framework-like approach and you're becoming very dependent on them, the markup they require and spit out, the functionalities they introduce and probably more important, those they don't introduce and those who hinder other features. This is not necessarily a bad thing and they might greatly improve your productivity, but if some project is discontinued or you find out, that you need a functionality you won't we be able to implement without a significant investment and the project owner doesn't care about, you're stuck. Sure make a fork, but we all know how they usually don't evolve beyond the scale of the current project. 

This is why `ng-fab-form` focusses on the basic angular functions and tries to extend them application-wide, while always giving you the option to throw out what doesn't fit in. Worst case scenario: You completely remove `ng-fab-form` because you don't like it and then you're back to standard angular, with probably almost no effort spend, almost no time wasted.


## manual installation and dependencies

Grab the minified [ng-fab-form file](https://github.com/johannesjo/ng-fab-form/blob/master/dist/ng-fab-form.min.js) from the dist folder. You also need to install [ng-messags](https://docs.angularjs.org/api/ngMessages/directive/ngMessages), jQuery and [jquery.bind-first](https://github.com/private-face/jquery.bind-first). 
There might be a jQuery-independend version in the future, but for now it is much easier and also safer to just rely on exeternal sources, when it comes to cross-browser-event-handling.


## configuring options

Currently the configuration object of ng-fab-forms looks like this:
```
// validation template-url/templateId
// to disable validation completely set it false
template: 'default-validation-msgs.html',

// show validation messages
showValidationMsgs: true,

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

// add noovalidate to forms
setNovalidate: true,

// set form-element names based on ngModel if not set
setNamesByNgModel: true,

// add asterisk to required fields
setAsteriskForRequiredLabel: false,

// asterisk string to be added if enabled
asteriskStr: '*',

// event-name-space, usually you won't need to change anything here
eventNameSpace: 'ngFabForm',

// the validation message prefix, results for the default state
// `validation-msg-required` or `validation-msg-your-custom-validation`
validationMsgPrefix: 'validationMsg'
```
You can easily extend those configurations like this:
```javascript
angular.module('exampleApp', [
    'ngFabForm',
    'ngMessages'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            scrollToAndFocusFirstErrorOnSubmit: false,
            setNovalidate: false
        });
    });

```

## create your own validation template

`ng-fab-form` comes with a reasonable default validation template, which is used for every form element with `ng-model` set, but you can easily create your own! You can use any attribute and directive, as you would with vanilla angular. In addition the input-element attributes are available for you convenience, too!
```html

<div ng-messages="field.$error"
     class="validation">
     <!-- Show errors for invalid fields, when it has been either focused, has been changed or the user tried to submit the form without success (requires the setDirtyOnSubmit-option to be set-->
    <ul class="list-unstyled validation-errors"
        ng-show="field.$invalid && (field.$touched || field.$dirty || form.$triedSubmit)">
        <li ng-message="required">This field is required</li>
        <li ng-message="password">This is not a valid password</li>
        <li ng-message="email"> This is not a valid email-address</li>
        <li ng-message="pattern">Your input does not match the requirements</li>
        <li ng-message="date">This is not a valid date</li>
        <li ng-message="time">This is not a valid time</li>
        <li ng-message="datetime"> This is no valid datetime</li>
        <li ng-message="datetime-local">This is no valid local datetime</li>
        <li ng-message="number">This is no valid number</li>
        <li ng-message="color">This no valid color</li>
        <li ng-message="range">This is not a valid range</li>
        <li ng-message="month">This is not a valid month</li>
        <li ng-message="url">This is not a valid url</li>
        <li ng-message="file">This not a valid file</li>

        <!-- ng-fab-form provides you with access to the input-element-attributes, allowing you to display their values inside of the message-->
        <li ng-message="minlength">Your field should have at least {{ attrs.minlength }} characters</li>
        <li ng-message="maxlength">Your field should have max {{ attrs.maxlength }} characters</li>

        <li ng-if="attrs.type == 'time' "
            ng-message="min">The time provided should be no earlier than {{ attrs.min |date: 'HH:MM' }}
        </li>
        
        <!-- you can use ng-if or ng-show for more advanced error messages -->
        <li ng-message="max"
            ng-if="attrs.type == 'time' ">The time should be no later than {{attrs.max |date: 'HH:MM'}}
        </li>
        <li ng-message="min"
            ng-if="attrs.type == 'date' ">The date provided should be no earlier than then {{attrs.max
            |date:'dd.MM.yy'}}
        </li>        
        <li ng-message="max"
            ng-if="attrs.type == 'date' ">The time should be no later than {{attrs.max |date: 'dd.MM.yy'}}
        </li>
    </ul>
    <!-- It is also possible to show a success element using the standard form syntax -->
    <div class="validation-success"
         ng-show="field.$valid && !field.$invalid">
    </div>
</div>

```
To load you own validations simply set the template url in your configuration:
```javascript
angular.module('exampleApp', [
    'ngFabForm',
    'ngMessages'
])
    .config(function (ngFabFormProvider)
    {
        ngFabFormProvider.extendConfig({
            validationsTemplate : 'path/to/your-fabolous-validation-template.html'
        });
    });
```


## special validations (e.g. ng-pattern)

Sometimes you might want to have another text for a specifc context. Special validation-messages like this are easily added like this:
```html
<input type="text"
       ng-model="my-model"
       ng-pattern="/abcdefg/"
       validation-msg-pattern="Not abcdefg :(">
```



## advanced configuration


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

## ❤ contribute ❤

I'm happy for any [issue or feature request](https://github.com/johannesjo/ng-fab-form/issues), you might encounter or want to have. Even a one liner is better, than no feedback at all. Pull requests are also highly welcome. Just fork the repository, clone it and run `grunt serve` for development.

`ng-fab-form` is published under the [The GNU Lesser General Public License V2.1](https://github.com/johannesjo/ng-fab-form/blob/master/LICENSE).






