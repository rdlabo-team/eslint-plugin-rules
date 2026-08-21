# @rdlabo/rules/no-template-driven-forms

> Disallow template-driven forms except `ngModel` bindings on explicitly allowed elements.

This rule restricts template-driven forms in Angular templates. `ngForm` and `ngModelGroup` are always rejected because they carry mutable form state inside the template. `ngModel` is also rejected unless it is placed on an element that has been explicitly allowlisted for an Ionic View binding that is not suitable for Signal Forms.

An allowed element is an interoperability exception, not a recommendation to use template-driven forms. Submission forms should use Signal Forms even when they contain an allowed element.

## Rule Details

The rule runs against Angular templates and checks three patterns:

1. **`ngModel` on an element that is not in `allowedElements`**
   Reports `ngModel`, `[(ngModel)]`, and `[ngModel]` on elements whose tag name is not in the allowlist. A standalone `(ngModelChange)` output is not inspected.

2. **`ngModelGroup` attribute**
   Reports any `ngModelGroup` attribute on any element.

3. **`ngForm` reference or directive**
   Reports `<form #form="ngForm">` and `<div ngForm>`.

The rule is not a type-aware rule; it operates purely on parsed template AST.

## Examples

### Incorrect

```html
<!-- ngModel on an ordinary input -->
<input [(ngModel)]="name" />

<!-- ngForm reference -->
<form #form="ngForm"></form>

<!-- ngModelGroup directive -->
<div ngModelGroup="address"></div>
```

### Correct

```html
<!-- Signal Forms field binding -->
<input [formField]="userForm.name" />

<!-- ngModel allowed on ion-searchbar for a View binding -->
<ion-searchbar [(ngModel)]="query"></ion-searchbar>
```

## Options

```json
{
  "rules": {
    "@rdlabo/rules/no-template-driven-forms": [
      "error",
      {
        "allowedElements": ["ion-searchbar", "ion-segment", "ion-radio-group", "ion-select", "ion-range", "ion-toggle", "ion-checkbox", "ion-input-otp"]
      }
    ]
  }
}
```

### `allowedElements`

- Type: `string[]`
- Default: `[]`

Element tag names that are permitted to use `ngModel`. This is intended for Ionic components that expose a value through `ngModel` as a view convenience, such as `ion-searchbar` or `ion-toggle`. Even when an element is allowed, `ngModelGroup` and `ngForm` are still reported.

## When to enable

Enable this rule when a project is migrating to Angular Signal Forms but still needs limited `ngModel` bindings for specific Ionic View components. Disable it only when a project is fully committed to Reactive Forms and does not plan to adopt Signal Forms.

## See also

- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## Implementation

- [Rule source](../../src/rules/no-template-driven-forms.ts)
- [Test source](../../tests/rules/no-template-driven-forms.ts)
