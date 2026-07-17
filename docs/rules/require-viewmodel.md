# @rdlabo/rules/require-viewmodel

> Enforce Component `new ViewModel(this)`, `ViewModelStore<ComponentType, Keys>` inheritance, and keep View APIs off ViewModel.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Enforces the Ionic Angular Component / ViewModel split in one rule. The co-located class name is `ViewModel` by default.

| Check               | Requirement                                                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component ownership | Every `@Component` has a field initialized with `new ViewModel(this)`                                                                                |
| Construction        | First argument must be `this`                                                                                                                        |
| Host boundary       | ViewModel extends `ViewModelStore<ComponentType, Keys>`; `Keys` optionally exposes explicit non-Signal Component properties                          |
| Constructor / host  | ViewModel inherits both by default; an optional constructor must forward `host` with `super(host)`                                                   |
| View APIs           | `viewChild` / `viewChildren` / `contentChild` / `contentChildren` / `effect` / `computed` / render lifecycle APIs must not appear inside `ViewModel` |

Non-`@Component` classes are ignored for ownership. Pair with `@rdlabo/rules/no-component-method-except-lifecycle`.

## Rule Details

✅ Signal and output host only

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly vm = new ViewModel(this);
}

class ViewModel extends ViewModelStore<ExamplePage> {
  save(): void {
    this.host.saved.emit();
  }
}
```

`ViewModelStore` owns the constructor and retains the Component object. Its public `host` uses the `ViewModelHost<T, K>` type from `@rdlabo/ionic-angular-kit`, so values are read when ViewModel methods run instead of being copied during class-field initialization. The base constructor delegates host narrowing and the one-time render hook to the kit's `mountViewModel()` helper.

✅ Explicit non-Signal dependencies

```ts
class ViewModel extends ViewModelStore<EntryPage, 'entryForm' | 'inventoryModel'> {
  save(): void {
    this.host.entryForm.save();
  }
}
```

The second type argument is optional. TypeScript checks that its keys belong to the Component. Hard-private Component fields cannot be exposed with `Pick`; use a public `readonly` boundary property when the ViewModel needs one.

✅ Shared ViewModel bases

```ts
class ViewModel extends MainViewModel<FoodsPage> {}
class ViewModel extends ListViewModel<WineListPage> {}
class ViewModel extends ModelSearch<SearchPage, SearchCondition> {}
```

An intermediate base whose name ends in `ViewModel`, plus the established `ModelSearch` base, is accepted when its first type argument matches the owning Component. The intermediate base itself must inherit from `ViewModelStore`.

A generic ViewModel may use a default Component host. The default is used for the ownership check:

```ts
class ViewModel<THost = MainPage> extends ViewModelStore<THost> {}
```

Hard-private ViewModel ownership is also fine:

```ts
readonly #vm = new ViewModel(this);
```

❌ Component without ViewModel or without `this`

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  readonly title = 'x'; // error: missingViewModel
}

readonly vm = new ViewModel();
readonly vm = new ViewModel(other);
```

❌ Old per-ViewModel host pattern

```ts
class ViewModel extends StoreModel {
  readonly host: ReactiveHost<ExamplePage>; // error

  constructor(host: ExamplePage) {
    super();
    this.host = host;
  }
}
```

Use `extends ViewModelStore<ExamplePage>` and remove the host member. Do not cache `host.someProperty` in a ViewModel constructor: Component class fields declared after `vm` have not initialized yet.

A constructor is usually unnecessary. Prefer `onMount()` for setup that must wait until the Component has initialized. If an existing immediate constructor side effect must be preserved, its constructor must forward the same typed host:

```ts
class ViewModel extends ViewModelStore<ExamplePage, 'inventoryModel'> {
  protected override onMount(): void {
    this.host.inventoryModel.initialize();
  }
}
```

An immediate constructor remains valid for compatibility:

```ts
class ViewModel extends ViewModelStore<ExamplePage> {
  constructor(host: ExamplePage) {
    super(host);
    registerCleanup();
  }
}
```

❌ View APIs on ViewModel

```ts
class ViewModel extends ViewModelStore<ExamplePage> {
  readonly el = viewChild('host'); // error
  readonly label = computed(() => 'x'); // error
}
```

`viewChild.required(...)` is also denied. `afterNextRender` / `afterEveryRender` / `afterRenderEffect` belong to the kit `mountViewModel()` helper or the Component, not an individual ViewModel.

## Options

```ts
{
  // Class name treated as the ViewModel. default: 'ViewModel'
  viewModelClassName?: string;

  // Required base-class name. default: 'ViewModelStore'
  viewModelStoreClassName?: string;

  // Call expressions banned inside ViewModel.
  // default also denies afterNextRender / afterEveryRender / afterRenderEffect
  bannedApis?: string[];
}
```

```js
'@rdlabo/rules/require-viewmodel': 'error';
```

Custom names:

```js
[
  'error',
  {
    viewModelClassName: 'PageState',
    viewModelStoreClassName: 'HostedStore',
  },
];
```

## Implementation

- [Rule source](../../src/rules/require-viewmodel.ts)
- [Test source](../../tests/rules/require-viewmodel.ts)
