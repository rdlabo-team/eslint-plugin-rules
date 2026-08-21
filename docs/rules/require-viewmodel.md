# @rdlabo/rules/require-viewmodel

> Enforce Component `new ViewModel(this)`, `ViewModelStore<ComponentType, Keys>` inheritance, and keep View APIs off ViewModel.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

This rule enforces the ViewModel architecture pattern. An Angular Component must own a ViewModel initialized with `new ViewModel(this)`. The rule requires at least one matching property; it does not reject additional ViewModel instances. The ViewModel must extend `ViewModelStore<ComponentType>` and should not redeclare `host` or contain View-specific APIs such as `viewChild`, `effect`, `computed`, or `afterNextRender`.

## Rule Details

The rule performs three checks:

### 1. Component must own a ViewModel

A `@Component` class must contain a property initialized with `new ViewModel(this)`. The first argument of the constructor call must be `this`.

### 2. ViewModel must extend `ViewModelStore<ComponentType>`

The class named `ViewModel` (or the configured `viewModelClassName`) must extend `ViewModelStore<...>` or a base whose name ends with `ViewModel` or is `ModelSearch`. The first generic argument must be the host Component type. Intermediate generic defaults are resolved.

- If `ViewModelStore<ExamplePage, 'model' | 'form'>` is used, the second and later type arguments are allowed.
- More than two type arguments when extending `ViewModelStore` directly is reported.
- The host type must match the Component that owns the ViewModel.

### 3. ViewModel must not contain View APIs

The ViewModel class must not call the following APIs:

`viewChild`, `viewChildren`, `contentChild`, `contentChildren`, `effect`, `computed`, `afterNextRender`, `afterEveryRender`, `afterRenderEffect`.

This list can be customized with the `bannedApis` option. The rule recognizes direct calls such as `viewChild()` and the `.required()` variant such as `viewChild.required()`. It does not resolve namespace-prefixed calls.

## Examples

### Incorrect

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly title = 'x'; // no ViewModel
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(); // missing `this`
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends StoreModel {} // wrong base class
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage> {
  readonly el = viewChild('host'); // View API in ViewModel
}
```

### Correct

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

class ViewModel extends ViewModelStore<ExamplePage> {
  readonly label = signal('hello');
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage, 'inventoryModel'> {
  readonly inventoryModel = signal<Inventory | null>(null);
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class FoodsPage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends MainViewModel<FoodsPage> {}
```

## Options

```json
{
  "rules": {
    "@rdlabo/rules/require-viewmodel": [
      "error",
      {
        "viewModelClassName": "ViewModel",
        "viewModelStoreClassName": "ViewModelStore",
        "bannedApis": [
          "viewChild",
          "viewChildren",
          "contentChild",
          "contentChildren",
          "effect",
          "computed",
          "afterNextRender",
          "afterEveryRender",
          "afterRenderEffect"
        ]
      }
    ]
  }
}
```

### `viewModelClassName`

- Type: `string`
- Default: `"ViewModel"`

The class name the rule looks for in the Component. Use this when the project uses a different naming convention, such as `PageState`.

### `viewModelStoreClassName`

- Type: `string`
- Default: `"ViewModelStore"`

The base class name the ViewModel must extend, or an intermediate base whose name ends with `ViewModel`.

### `bannedApis`

- Type: `string[]`
- Default: the list above

APIs that are not allowed inside the ViewModel. The rule detects direct calls and `.required(...)` usage; namespace-prefixed calls are not resolved.

## When to enable

Enable this rule when a project adopts the ViewModel pattern with `@rdlabo/ionic-angular-kit` or a similar architecture. It pairs with [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md) to keep Component state read-only and ViewModel state writable.

## See also

- [`@rdlabo/rules/no-component-writable-signal`](./no-component-writable-signal.md)
- [`@rdlabo/rules/no-component-method-except-lifecycle`](./no-component-method-except-lifecycle.md)

## Implementation

- [Rule source](../../src/rules/require-viewmodel.ts)
- [Test source](../../tests/rules/require-viewmodel.ts)
