# @rdlabo/rules/no-reactive-forms

> Disallow Angular Reactive Forms in favor of Signal Forms.

Disallows Angular Reactive Forms APIs and template bindings in favor of `@angular/forms/signals`.

The rule rejects `ReactiveFormsModule`, `FormControl`, `FormGroup`, `FormArray`, builders, `Validators`, and related imports from `@angular/forms`. In templates it rejects `formControl`, `formControlName`, `formGroup`, `formGroupName`, and `formArrayName`.

`FormsModule` and `ngModel` are intentionally outside this rule; use `no-template-driven-forms` for those bindings.

## Implementation

- [Rule source](../../src/rules/no-reactive-forms.ts)
- [Test source](../../tests/rules/no-reactive-forms.ts)
