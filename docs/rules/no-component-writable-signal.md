# @rdlabo/rules/no-component-writable-signal

> Keep writable component state in ViewModel, except models passed to Angular Signal Forms `form()`.

Keeps writable Component state in ViewModel. The only Component-local `signal()` exception is a model passed to Angular Signal Forms `form()`.

```ts
readonly model = signal({ name: '' });
readonly profileForm = form(this.model); // valid

readonly isLoading = signal(false); // invalid: move to ViewModel
```

`computed()` and `effect()` remain Component responsibilities and are not restricted by this rule. Non-Component classes are ignored.

## Implementation

- [Rule source](../../src/rules/no-component-writable-signal.ts)
- [Test source](../../tests/rules/no-component-writable-signal.ts)
