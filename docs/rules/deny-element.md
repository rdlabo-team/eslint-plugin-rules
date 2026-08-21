# @rdlabo/rules/deny-element

> This plugin disallows the use of certain HTML tags.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

This rule prevents specific elements from being used in Angular templates. It is commonly used to ban inline overlay components such as `<ion-modal>`, `<ion-popover>`, `<ion-toast>`, `<ion-alert>`, `<ion-loading>`, `<ion-picker>`, and `<ion-action-sheet>`, which should be presented through launcher methods or dedicated services instead of being declared in the template.

## Rule Details

The rule runs on `.html` template files and reports any element whose tag name is in the configured `elements` list. It traverses the template AST, including Angular control flow syntax such as `@if`, `@for`, `@else`, and nested `then` / `else` branches.

- `.spec.html` files are ignored so that tests are not affected.
- Without an explicit option, the rule uses its default Ionic overlay element list. When an option object is supplied, its schema requires an `elements` array.

## Options

```json
{
  "rules": {
    "@rdlabo/rules/deny-element": [
      "error",
      {
        "elements": ["ion-modal", "ion-popover", "ion-toast", "ion-alert", "ion-loading", "ion-picker", "ion-action-sheet"]
      }
    ]
  }
}
```

### `elements`

- Type: `string[]`
- Default: `ion-modal`, `ion-popover`, `ion-toast`, `ion-alert`, `ion-loading`, `ion-picker`, `ion-action-sheet`

Array of element tag names to disallow. The rule compares these names to the `Element` node type in the Angular template AST, so it checks both the element itself and its presence inside control flow branches.

## Examples

### Incorrect

```html
<ion-modal></ion-modal>

<div>
  <ion-toast></ion-toast>
  <ion-alert></ion-alert>
</div>
```

```html
@if (showModal) {
<ion-modal>Modal content</ion-modal>
}
```

### Correct

```html
<ion-button (click)="presentModal()">Open</ion-button>
```

```html
@for (item of items; track item.id) {
<ion-card>
  <ion-card-header>{{ item.name }}</ion-card-header>
</ion-card>
}
```

## When to enable

Enable this rule in projects that use the launcher pattern for overlays. It pairs with [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md) and [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md) to keep modal and overlay logic out of the template.

## See also

- [`@rdlabo/rules/prefer-modal-launcher`](./prefer-modal-launcher.md)
- [`@rdlabo/rules/prefer-disable-handler`](./prefer-disable-handler.md)

## Implementation

- [Rule source](../../src/rules/deny-element.ts)
- [Test source](../../tests/rules/deny-element.ts)
