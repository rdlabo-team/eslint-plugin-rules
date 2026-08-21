# @rdlabo/rules/no-component-writable-signal

> Keep writable component state in ViewModel, except models passed to Angular Signal Forms `form()`.

This rule enforces a clear boundary between Angular Components and ViewModels. Components should expose read-only derived state to templates; writable state should live in a ViewModel so that changes are centralized and testable. The only writable Signal allowed on a Component is one passed directly to Signal Forms `form()` as its model.

## Rule Details

This rule inspects `@Component` decorated classes and reports class properties initialized with `signal()` or `linkedSignal()` from `@angular/core`, unless the same property is passed as the first argument to `form()` from `@angular/forms/signals`.

- `computed()` and `effect()` remain Component responsibilities and are not reported.
- Non-Component classes are ignored.
- Aliased and namespace imports from `@angular/core` and `@angular/forms/signals` are recognized.
- Same-named local helpers are ignored because the rule verifies import provenance.

The Signal Forms exception only recognizes a Component property initializer such as `readonly pageForm = form(this.model)`. Passing the Signal to `form()` inside a method does not create an exception, so the writable Signal property is still reported.

## Examples

### Incorrect

```ts
import { Component, signal } from '@angular/core';

@Component({ template: '' })
class Page {
  readonly isLoading = signal(false); // reported: move to ViewModel
}
```

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly model = signal({ name: '' });
  readonly loading = signal(false); // reported
  readonly pageForm = form(this.model);
}
```

### Correct

```ts
import { Component, computed } from '@angular/core';
import { form } from '@angular/forms/signals';
import { PageViewModel } from './page.viewmodel';

@Component({ template: '' })
class Page {
  private readonly vm = new PageViewModel(this);
  readonly isLoading = this.vm.isLoading; // read-only view of ViewModel state
  readonly model = this.vm.model;
  readonly pageForm = form(this.model);
  readonly title = computed(() => this.model().name);
}
```

```ts
import { Component, signal as writable } from '@angular/core';
import { form as signalForm } from '@angular/forms/signals';

@Component({ template: '' })
class Page {
  readonly data = writable({ name: '' });
  readonly pageForm = signalForm(this.data); // data is the Signal Forms model
}
```

## Options

This rule has no options.

## When to enable

Enable this rule when a project uses the ViewModel pattern with `@rdlabo/rules/require-viewmodel`. It ensures that Component properties are read-only views into shared state, which prevents Components from mutating state directly.

## See also

- [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md)
- [`@rdlabo/rules/no-reactive-forms`](./no-reactive-forms.md)

## Implementation

- [Rule source](../../src/rules/no-component-writable-signal.ts)
- [Test source](../../tests/rules/no-component-writable-signal.ts)
