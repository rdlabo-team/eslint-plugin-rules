# @rdlabo/rules/no-component-writable-signal

> Keep writable component state in ViewModel, except models passed to Angular Signal Forms `form()`.

Keeps writable Component state in ViewModel. Component-local `signal()` and `linkedSignal()` are rejected unless the property is a model passed directly to a Signal Forms field initializer such as `profileForm = form(this.model)`.

```ts
readonly model = signal({ name: '' });
readonly profileForm = form(this.model); // valid

readonly isLoading = signal(false); // invalid: move to ViewModel
```

`computed()` and `effect()` remain Component responsibilities and are not restricted by this rule. Non-Component classes are ignored.

Named aliases and namespace imports from `@angular/core` and `@angular/forms/signals` are supported. Same-named local helpers are ignored because the rule verifies import provenance.

## Implementation

- [Rule source](../../src/rules/no-component-writable-signal.ts)
- [Test source](../../tests/rules/no-component-writable-signal.ts)
