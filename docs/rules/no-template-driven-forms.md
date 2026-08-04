# @rdlabo/rules/no-template-driven-forms

> Disallow template-driven forms except `ngModel` bindings on explicitly allowed elements.

Disallows `ngModel` unless its element name is explicitly allowed for an Ionic View binding that is not suitable for Signal Forms. `ngForm` and `ngModelGroup` are always rejected.

```js
'@rdlabo/rules/no-template-driven-forms': [
  'error',
  {
    allowedElements: [
      'ion-searchbar',
      'ion-segment',
      'ion-radio-group',
      'ion-select',
      'ion-range',
      'ion-toggle',
      'ion-checkbox',
      'ion-input-otp',
    ],
  },
];
```

An allowed element is an interoperability exception, not a recommendation to use template-driven forms. Submission forms should use Signal Forms even when they contain an allowed element.

## Implementation

- [Rule source](../../src/rules/no-template-driven-forms.ts)
- [Test source](../../tests/rules/no-template-driven-forms.ts)
