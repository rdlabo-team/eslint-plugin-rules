# @rdlabo/rules/no-reactive-forms

> Disallow Angular Reactive Forms in favor of Signal Forms.

Disallows Angular Reactive Forms APIs and template bindings in favor of `@angular/forms/signals`.

The rule rejects `ReactiveFormsModule`, typed and untyped controls/groups/arrays/builders, reactive directives, `Validators`, and related imports from `@angular/forms`. Namespace/default imports are rejected because they can bypass named-API checks. In templates it rejects `formControl`, `formControlName`, `formGroup`, `formGroupName`, and `formArrayName`.

`FormsModule` and `ngModel` are intentionally outside this rule; use `no-template-driven-forms` for those bindings.

## Implementation

- [Rule source](../../src/rules/no-reactive-forms.ts)
- [Test source](../../tests/rules/no-reactive-forms.ts)
