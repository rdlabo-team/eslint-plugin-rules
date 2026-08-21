# @rdlabo/rules/no-reactive-forms

> Disallow Angular Reactive Forms in favor of Signal Forms.

This rule helps migrate from Angular Reactive Forms to `@angular/forms/signals`. Reactive Forms require mutable `FormControl` / `FormGroup` state that is often shared between components and services, which makes it harder to track where state changes originate. Signal Forms keep form state in Signals, so the dependency graph is explicit and reactive by default.

Use this rule when you want to prevent new Reactive Forms code from being introduced while a project is adopting Signal Forms.

## Rule Details

This rule reports three patterns:

1. **Named imports of Reactive Forms APIs from `@angular/forms`**
   Any import of the following names is reported:

   `AbstractControl`, `FormArray`, `FormArrayName`, `FormBuilder`, `FormControl`, `FormControlDirective`, `FormControlName`, `FormGroup`, `FormGroupDirective`, `FormGroupName`, `FormRecord`, `NonNullableFormBuilder`, `ReactiveFormsModule`, `UntypedFormArray`, `UntypedFormBuilder`, `UntypedFormControl`, `UntypedFormGroup`, `Validators`.

2. **Namespace or default imports from `@angular/forms`**
   `import * as forms from '@angular/forms'` and `import forms from '@angular/forms'` are reported because they can bypass the named-API checks.

3. **Reactive Forms template bindings**
   The following bindings are reported in Angular templates:
   `formControl`, `formControlName`, `formGroup`, `formGroupName`, `formArrayName`.

`FormsModule` and `ngModel` are intentionally outside the scope of this rule. Use [`@rdlabo/rules/no-template-driven-forms`](./no-template-driven-forms.md) to restrict those.

## Examples

### Incorrect

```ts
// TypeScript: importing Reactive Forms APIs
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import * as forms from '@angular/forms';
const control = new forms.FormControl('');
```

```html
<!-- Template: Reactive Forms bindings -->
<form [formGroup]="userForm">
  <input formControlName="name" />
</form>
```

### Correct

```ts
import { signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

const userModel = signal({ name: '' });
const userForm = form(userModel, (path) => {
  required(path.name);
});
```

```html
<!-- Template: Signal Forms field binding -->
<input [formField]="userForm.name" />
```

## Options

This rule has no options.

## When to enable

Enable this rule in Angular projects that have adopted Signal Forms, or in projects that are migrating away from Reactive Forms. It is safe to enable alongside `@rdlabo/rules/no-template-driven-forms` to cover both form styles.

## See also

- [`@rdlabo/rules/no-template-driven-forms`](./no-template-driven-forms.md)
- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)

## Implementation

- [Rule source](../../src/rules/no-reactive-forms.ts)
- [Test source](../../tests/rules/no-reactive-forms.ts)
