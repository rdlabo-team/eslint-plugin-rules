# @rdlabo/rules/ionic-attr-type-check

> This plugin disallows string values for non-string attributes in Ionic components.

This rule prevents TypeScript build errors by detecting when string values are assigned to non-string attributes (boolean, number, object, complex) in Ionic component templates and suggests proper property binding.

## Rule Details

This rule detects when string values are assigned to non-string attributes (boolean, number, object, complex) in Ionic component templates.

❌ Incorrect: Using string values for non-string attributes

```html
<ion-item button="true"></ion-item>
<ion-list inset="true"></ion-list>
<ion-progress-bar value="50"></ion-progress-bar>
<input disabled="false"></input>
<button readonly="1"></button>
```

✅ Correct: Using property binding

```html
<ion-item [button]="true"></ion-item>
<ion-list [inset]="true"></ion-list>
<ion-progress-bar [value]="50"></ion-progress-bar>
<input [disabled]="false"></input>
<button [readonly]="true"></button>
```

## Options

No Options.

## Supported Attribute Types

This rule automatically identifies non-string attributes from Ionic component type definitions and detects attributes such as:

### Ionic Component Attribute Examples

- `ion-item`: `button`, `disabled`, `detail`
- `ion-list`: `inset`, `lines`
- `ion-button`: `disabled`, `expand`, `fill`, `strong`
- `ion-checkbox`: `checked`, `disabled`, `indeterminate`
- `ion-toggle`: `checked`, `disabled`
- `ion-radio`: `checked`, `disabled`
- `ion-input`: `disabled`, `readonly`, `required`
- `ion-textarea`: `disabled`, `readonly`, `required`
- `ion-select`: `disabled`, `multiple`, `required`
- `ion-datetime`: `disabled`, `readonly`
- `ion-range`: `disabled`, `pin`, `snaps`
- `ion-segment`: `disabled`
- `ion-slides`: `pager`, `scrollbar`
- `ion-tab`: `selected`
- `ion-menu`: `disabled`, `swipeGesture`
- `ion-modal`: `animated`, `backdropDismiss`, `showBackdrop`
- `ion-popover`: `animated`, `backdropDismiss`, `showBackdrop`
- `ion-alert`: `animated`, `backdropDismiss`
- `ion-loading`: `animated`, `backdropDismiss`
- `ion-toast`: `animated`
- `ion-action-sheet`: `animated`, `backdropDismiss`

## Error Message

This rule displays the following message:

```
boolean attribute 'button' should not have a string value 'true'. Use property binding [button]="true" instead.
number attribute 'value' should not have a string value '50'. Use property binding [value]="50" instead.
```

## Implementation

- [Rule source](../../src/rules/ionic-attr-type-check.ts)
- [Test source](../../tests/rules/ionic-attr-type-check.ts)
