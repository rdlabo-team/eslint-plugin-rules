# @rdlabo/rules/require-ion-item-group

> Require ion-item elements in ion-list to be wrapped by a supported Ionic item group.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Ionic's iOS 26 and Material Design 3 list styling expects list items to be organized through the group component that matches their behavior. This rule prevents a bare `ion-item` from being rendered directly under `ion-list`.

## Rule Details

An `ion-item` within `ion-list` must use exactly one of these structures:

- `ion-list > ion-item-group > ion-item`
- `ion-list > ion-reorder-group > ion-item`
- `ion-list > ion-accordion-group > ion-accordion > ion-item`
- `ion-list > ion-radio-group > ion-item`

Angular control-flow blocks such as `@if`, `@for`, `@empty`, `@switch`, and `@defer` are transparent for this structural check because they do not render an element. `ng-container` is also transparent. Other HTML or Angular elements are not transparent: inserting a `div` between the list, group, or item is reported.

The rule only checks `ion-item` elements contained by `ion-list`. An `ion-item` outside a list is not reported, and `.spec.html` files are ignored.

## Examples

### Incorrect

```html
<ion-list>
  <ion-item>Direct item</ion-item>
</ion-list>
```

```html
<ion-list>
  @for (item of items; track item.id) {
  <ion-item>{{ item.name }}</ion-item>
  }
</ion-list>
```

### Correct

```html
<ion-list>
  <ion-item-group>
    @for (item of items; track item.id) {
    <ion-item>{{ item.name }}</ion-item>
    }
  </ion-item-group>
</ion-list>
```

```html
<ion-list>
  <ion-radio-group>
    <ion-item>First choice</ion-item>
    <ion-item>Second choice</ion-item>
  </ion-radio-group>
</ion-list>
```

## Options

This rule has no options.

## When to enable

Enable this rule in Ionic Angular applications that target the iOS 26 and Material Design 3 list designs. It is included in the recommended preset and has no effect when a template does not contain an `ion-item` within `ion-list`.

## Implementation

- [Rule source](../../src/rules/require-ion-item-group.ts)
- [Test source](../../tests/rules/require-ion-item-group.ts)
