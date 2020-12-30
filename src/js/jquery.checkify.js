import '../scss/jquery.checkify.scss';

/*!
 * Checkify - A light-weight, mobile-ready and customizable validation plugin for jQuery
 *
 * Copyright 2018, Mehdi Dehghani
 *
 * @author   Mehdi Dehghani (http://www.github.com/dehghani-mehdi)
 * @license  Licensed under MIT (https://github.com/dehghani-mehdi/checkify/blob/master/LICENSE)
 *
 * Version: 0.0.10
 */
;
(function ($, window, document, undefined) {
    const pluginName = 'checkify',
        _rules = 'minlen|maxlen|required|number|email|regex|func|between'.split('|'),
        _number = /^[\-\+]?(\d+|\d+\.?\d+)$/,
        // https://stackoverflow.com/q/46155/3367974
        _email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        p = {};

    p[pluginName] = class {
        constructor(el, config) {
            this.el = el;
            this.$el = $(el);

            this.config = $.extend(true, {}, $.fn.defaults, config);

            this.$container = this.config.container ?
                typeof this.config.container === 'string' ?
                    $(this.config.container) :
                    this.config.container :
                $(el);

            this.init();
        }

        init() {
            this.$container.addClass('checkify');

            this.wireEvents();
        }

        /**
         * wire up events
         */
        wireEvents() {
            if (this.$container.is('form')) {
                this.$container.on('submit', (e) => {
                    this.parseAllElements();

                    if (this.$container.find('.checkify__has-error').length > 0) {
                        e.preventDefault();

                        if (typeof this.config.onError === 'function') this.config.onError.call(e.currentTarget, e);

                    } else {
                        if (typeof this.config.onValid === 'function') this.config.onValid.call(e.currentTarget, e);
                    }
                });
            }

            this.$container.find('[data-checkify]').not('[type=checkbox]').on('change', (e) => {
                let $this = $(e.currentTarget);

                $this.removeClass('checkify__has-error');

                if (this.config.realTime) this.check($this);
            });

            if (this.config.trigger) {
                this.$container.find(this.config.trigger).on('click', (e) => {
                    this.parseAllElements();

                    if (this.$container.find('.checkify__has-error').length > 0) {
                        e.preventDefault();
                        if (typeof this.config.onError === 'function') this.config.onError.call(e.currentTarget, e);

                    } else {
                        if (typeof this.config.onValid === 'function') this.config.onValid.call(e.currentTarget, e);
                    }
                });
            }

            this.$container.find('[data-checkify*=number]').on('keypress', (e) => {
                let $this = $(e.currentTarget);

                let code = e.charCode || e.which;

                if ((47 < code && code < 58) || (1632 < code && code < 1642) || (1775 < code && code < 1786) || code === 0 || code === 8) { }
                else e.preventDefault();
            });
        };

        /**
         * parse all elements and then parse its data checkify
         */
        parseAllElements() {
            this.$container.find('.checkify__has-error').removeClass('checkify__has-error');

            this.$container.find('[data-checkify]').each((i, el) => this.check($(el)));
        }

        /**
         * replaced multiple spaces with one and non-english numbers to english numbers
         * @param s
         */
        normalize(s) {
            let charCodeZero = '۰'.charCodeAt(0),
                temp = s.replace(/[۰-۹]/g, (w) => w.charCodeAt(0) - charCodeZero);

            charCodeZero = '٠'.charCodeAt(0);
            temp = temp.replace(/[٠-٩]/g, (w) => w.charCodeAt(0) - charCodeZero);

            return temp.replace(/  +/g, ' ');
        };

        /**
         * insert error message next to given element
         * @param $el
         * @param message
         */
        appendMessage($el, message) {
            if (this.config.message.inactive) return;

            let rect = $el[0].getBoundingClientRect();

            $('<span />', {
                class: 'checkify__message checkify__message-' + this.config.message.position,
                text: message,
                css: {
                    top: rect.height,
                    ['margin-' + this.config.message.position]: this.config.message.hGap || 0,
                    'margin-top': this.config.message.vGap || 5
                }
            }).insertAfter($el);
        };

        /**
         * find and parse data-checkify of given element
         * @param $el
         */
        check($el) {
            let $next = $el.next(),
                data = $el.data('checkify');

            if ($next.hasClass('checkify__message')) $next.remove();

            if (typeof data !== 'undefined') {
                // find regex rule
                let regexRule = data.match(/regex=(.+`)/);
                // because match returns array and we need string
                regexRule = regexRule ? regexRule[0] : null;
                // remove regex from data-checkify
                if (regexRule) {
                    data = data.replace(regexRule, '');
                    regexRule = regexRule.replace(/`/g, '');
                }

                // find func rule
                let funcRule = data.match(/func=[^,]*/);
                // because match returns array and we need string
                funcRule = funcRule ? funcRule[0] : null;
                // remove func from data-checkify
                if (funcRule) data = data.replace(funcRule, '');

                // find between rule
                let betweenRule = data.match(/between=[^,]*/);
                // because match returns array and we need string
                betweenRule = betweenRule ? betweenRule[0] : null;
                // remove between from data-checkify
                if (betweenRule) data = data.replace(betweenRule, '');

                // remove empty entries
                let rules = data.split(',').filter(Boolean);

                // add regex to rules
                if (regexRule) rules.push(regexRule);

                // add func to rules
                if (funcRule) rules.push(funcRule);

                // add range to rules
                if (betweenRule) rules.push(betweenRule);

                let methods = rules.filter(x => _rules.indexOf(x.split('=')[0]) > -1),
                    requiredPos = methods.indexOf('required');

                if (methods.length > 0) {
                    // put required at first (if any)
                    if (requiredPos > -1) {
                        methods.splice(requiredPos, 1);
                        methods.unshift('required');
                    }

                    for (let i = 0; i < methods.length; i++) {
                        let split = methods[i].split('='),
                            method = split[0];

                        if (!eval(this._methods[method])($el, split[1])) {
                            $el.addClass('checkify__has-error');
                        }
                    }
                }
            }
        };

        _methods = {
            'required': ($el) => {
                if ($el.is('select')) {
                    return $el.val() && $el.val().length > 0;
                } else if ($el.attr('type') === 'checkbox') {
                    return $el.is(':checked');
                } else {
                    let normalized = this.normalize($el.val());

                    if (normalized.length < 1) {
                        if (!this.config.message.inactiveForRequired) this.appendMessage($el, this.config.message.required);

                        return false;
                    }
                }

                return true;
            },
            'minlen': ($el, len) => {
                let normalized = this.normalize($el.val());

                if (normalized.length > 0 && normalized.length < len) {
                    if (!$el.hasClass('checkify__has-error')) this.appendMessage($el, this.config.message.minlen.replace('{count}', len));
                    return false;
                }

                return true;
            },
            'maxlen': ($el, len) => {
                let normalized = this.normalize($el.val());

                if (normalized.length > 0 && normalized.length > len) {
                    if (!$el.hasClass('checkify__has-error')) this.appendMessage($el, this.config.message.maxlen.replace('{count}', len));
                    return false;
                }

                return true;
            },
            'number': ($el) => {
                let normalized = this.normalize($el.val());

                if (normalized.length > 0 && !_number.test(normalized)) {
                    if (!$el.hasClass('checkify__has-error')) this.appendMessage($el, this.config.message.number);

                    return false;
                }

                return true;
            },
            'email': ($el) => {
                let normalized = this.normalize($el.val());

                if (normalized.length > 0 && !_email.test(normalized.toLowerCase())) {
                    if (!$el.hasClass('checkify__has-error')) this.appendMessage($el, this.config.message.email);

                    return false;
                }

                return true;
            },
            'regex': ($el, r) => {
                let normalized = this.normalize($el.val()),
                    regexp = new RegExp(r);
                console.log(regexp);
                if (normalized.length > 0 && !regexp.test(normalized.toLowerCase())) {
                    if (!$el.hasClass('checkify__has-error')) this.appendMessage($el, this.config.message.regex);

                    return false;
                }

                return true;
            },
            'func': ($el, funcName) => {
                let r = eval(window[funcName]($el));

                if (r) return true;

                if (!$el.hasClass('checkify__has-error')) this.appendMessage($el, this.config.message.func);

                return false;
            },
            'between': ($el, between) => {
                let normalized = this.normalize($el.val()),
                    number = +normalized,
                    split = between.split('-'),
                    min = +split[0],
                    max = +split[1];

                if (normalized.length > 0 && (number < min || number > max)) {
                    if (!$el.hasClass('checkify__has-error')) this.appendMessage($el, this.config.message.between);

                    return false;
                }

                return true;
            }
        };
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new p[pluginName](this, options));
            }
        });
    };

    $.fn.defaults = {
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
            regex: 'Invalid data.',
            func: 'Invalid data',
            between: 'Invalid data',
            number: 'Please enter a valid number.',
            maxlen: 'Please enter no more than {count} characters.',
            minlen: 'Please enter at least {count} characters.',
            maxChecked: 'Maximum {count} options allowed.',
            minChecked: 'Please select at least {count} options.',
            notEqual: 'Please enter the same value again.',
            different: 'Fields cannot be the same as each other'
        },
        realTime: false,
        container: null,
        trigger: null,
        onValid: null,
        onError: null
    };
})(jQuery, window, document);