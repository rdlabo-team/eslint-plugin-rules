# @rdlabo/rules/no-string-boolean-ionic-attr

> This plugin disallows string values for boolean attributes in Ionic components.

This rule prevents TypeScript build errors (TS2322: Type string is not assignable to type boolean) by detecting when string values are assigned to boolean attributes in Ionic component templates.

## Rule Details

This rule detects when string values are assigned to boolean attributes in Ionic component templates.

❌ Incorrect: Using string values for boolean attributes

```html
<ion-item button="true"></ion-item>
<ion-list inset="true"></ion-list>
<input disabled="false"></input>
<button readonly="1"></button>
```

✅ Correct: Using property binding

```html
<ion-item [button]="true"></ion-item>
<ion-list [inset]="true"></ion-list>
<input [disabled]="false"></input>
<button [readonly]="true"></button>
```

## Options

No Options.

## Supported Boolean Attributes

This rule automatically identifies boolean attributes from Ionic component type definitions and detects attributes such as:

### Ionic Component Boolean Attributes Examples

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
Boolean attribute 'button' should not have a string value 'true'. Use property binding [button]="true" instead.
```

## Implementation

- [Rule source](../../src/rules/no-string-boolean-ionic-attr.ts)
- [Test source](../../tests/rules/no-string-boolean-ionic-attr.ts)
