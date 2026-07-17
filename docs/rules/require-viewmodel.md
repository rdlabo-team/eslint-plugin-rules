# @rdlabo/rules/require-viewmodel

> Enforce Component `new ViewModel(this)`, ViewModel `super()`, and keep View APIs off ViewModel.

Enforces the Ionic Angular Component / ViewModel split in one rule. The co-located class name is `ViewModel` by default.

| Check               | Requirement                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Component ownership | Every `@Component` has a field initialized with `new ViewModel(this)`                                                        |
| Construction        | First argument must be `this`                                                                                                |
| Inheritance         | `class ViewModel` must `extends` a base class                                                                                |
| Constructor         | ViewModel constructor must call `super()` / `super(...)`                                                                     |
| View APIs           | `viewChild` / `viewChildren` / `contentChild` / `contentChildren` / `effect` / `computed` must not appear inside `ViewModel` |

Non-`@Component` classes are ignored for ownership. Pair with `@rdlabo/rules/no-component-method-except-lifecycle`.

## Rule Details

✅ Correct

```ts
import { Component, computed, effect, viewChild } from '@angular/core';

@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
  readonly title = computed(() => this.vm.label());
  readonly el = viewChild('host');

  constructor() {
    effect(() => this.vm.label());
  }
}

class ViewModel extends StoreModel {
  constructor(readonly host: ExamplePage) {
    super();
  }

  readonly label = signal('hello');
}
```

Hard-private field is also fine:

```ts
readonly #vm = new ViewModel(this);
```

❌ Incorrect: Component without ViewModel

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly title = 'x'; // error: missingViewModel
}
```

❌ Incorrect: missing `this`

```ts
readonly vm = new ViewModel(); // error
readonly vm = new ViewModel(other); // error
```

❌ Incorrect: missing `extends` / `super()`

```ts
class ViewModel {
  constructor(readonly host: ExamplePage) {} // error: extends + super
}

class ViewModel extends StoreModel {
  constructor(readonly host: ExamplePage) {} // error: missing super()
}
```

❌ Incorrect: View APIs on ViewModel

```ts
class ViewModel extends StoreModel {
  readonly el = viewChild('host'); // error
  readonly label = computed(() => 'x'); // error

  constructor(readonly host: ExamplePage) {
    super();
    effect(() => {}); // error
  }
}
```

`viewChild.required(...)` is also denied.

## Options

```ts
{
  // Class name treated as the ViewModel. default: 'ViewModel'
  viewModelClassName?: string;

  // Call expressions banned inside ViewModel.
  // default: ['viewChild', 'viewChildren', 'contentChild', 'contentChildren', 'effect', 'computed']
  bannedApis?: string[];

  // Require `extends` on ViewModel. default: true
  requireExtends?: boolean;
}
```

```js
'@rdlabo/rules/require-viewmodel': 'error',
```

Custom class name:

```js
['error', { viewModelClassName: 'PageState' }];
```

## Implementation

- [Rule source](../../src/rules/require-viewmodel.ts)
- [Test source](../../tests/rules/require-viewmodel.ts)
