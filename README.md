# Checkify
A light-weight, mobile-ready and customizable form validation plugin for jQuery, inspired by [Validetta](https://github.com/hsnaydd/validetta)

[Demo](https://digitalify.github.io/checkify/)

## Usage

Include `jquery.checkify.js` and `jquery.checkify.css` to your page

```
<link rel="stylesheet" href="jquery.checkify.css" />

<!-- checkify is jQuery plugin, so... -->
<script src="jquery.js"></script>
<script src="jquery.checkify.js"></script>
```

__HTML__

```html
<!-- can be any html element, refer to container option -->
<form id="my-form">            
    <input type="text" data-checkify="minlen=10,required,number" />            
    <button>click me</button>
</form>
```

__JS__

```js
$('#my-form').checkify({
    // options
    onError: function () {
    	console.log('error');
    },
    onValid: function () {
    	console.log('valid');
    }
});
```

## Supported validation types

- required: usage: `<input type="text" data-checkify="required" />`
- minlen: usage: `<input type="text" data-checkify="minlen=10" />`
- maxlen: usage: `<input type="text" data-checkify="maxlen=30" />`
- number: usage: `<input type="text" data-checkify="number" />`
- email: usage: `<input type="text" data-checkify="email" />`
- regex: usage: `<input type="text" data-checkify="regex=^#(?:[0-9a-fA-F]{3}){1,2}$" />`
- func: usage: `<input type="text" data-checkify="func=yourFunctonName" />`
    - Chekify will pass `$el` to your function

## Available options

```js
message: {    
    inactive: false,
    // if true. error message won't be shown for required cases
    inactiveForRequired: true,
    // horizontal gap for error message box
    hGap: null,
    // vertical gap for error message box
    vGap: null,
    // can be right or left
    position: 'left',
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    func: 'Invalid data.',
    regex: 'Invalid data.',
    number: 'Please enter a valid number.',
    maxlen: 'Please enter no more than {count} characters.',
    minlen: 'Please enter at least {count} characters.',
    maxChecked: 'Maximum {count} options allowed.',
    minChecked: 'Please select at least {count} options.',
    notEqual: 'Please enter the same value again.',
    different: 'Fields cannot be the same as each other'
},
realTime: false,
// css selector or jQuery object, checkify will search for elements inside this
container: null,
// css selector, this will be used as trigger checkify
trigger: null,
// callback, can be function  
onValid: null,
// callback, can be function
onError: null
```

## License

[MIT](https://github.com/dehghani-mehdi/checkify/blob/master/LICENSE)
