# @rdlabo/rules/no-component-method-except-lifecycle

> Disallow non-lifecycle methods on `@Component`. Allowed lifecycle methods are derived from `implements` (properties are allowed).
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

This rule enforces thin Components. A Component should contain lifecycle hooks, delegated event handlers, and read-only view properties. Arbitrary business logic should live in a ViewModel, accessed through the Component's `vm` property.

## Rule Details

The rule checks methods inside `@Component` decorated classes:

- `constructor`, getters, and setters are ignored.
- Methods whose name matches a lifecycle interface declared in `implements` are allowed (for example, `ngOnInit` when `OnInit` is implemented, or `ionViewWillEnter` when `ViewWillEnter` is implemented).
- Methods listed in `additionalAllowedMethods` are allowed.
- All other method definitions are reported.

The rule also reports lifecycle methods that are used without the matching interface being implemented. For example, an `ionViewWillEnter` method without `implements ViewWillEnter` is reported.

## Supported lifecycle interfaces

| Interface             | Method                  |
| --------------------- | ----------------------- |
| `OnChanges`           | `ngOnChanges`           |
| `OnInit`              | `ngOnInit`              |
| `DoCheck`             | `ngDoCheck`             |
| `AfterContentInit`    | `ngAfterContentInit`    |
| `AfterContentChecked` | `ngAfterContentChecked` |
| `AfterViewInit`       | `ngAfterViewInit`       |
| `AfterViewChecked`    | `ngAfterViewChecked`    |
| `OnDestroy`           | `ngOnDestroy`           |
| `ViewWillEnter`       | `ionViewWillEnter`      |
| `ViewDidEnter`        | `ionViewDidEnter`       |
| `ViewWillLeave`       | `ionViewWillLeave`      |
| `ViewDidLeave`        | `ionViewDidLeave`       |
| `ViewWillUnload`      | `ionViewWillUnload`     |

## Examples

### Incorrect

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  open() {
    launchOtherPage(this.helper, {});
  }

  reload() {
    this.vm.reload$.next();
  }
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  ionViewWillEnter() {} // missing implements ViewWillEnter
}
```

### Correct

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter, ViewWillLeave, OnDestroy {
  readonly vm = new ViewModel(this);
  readonly open = () => launchOtherPage(this.helper, {});

  ionViewWillEnter() {
    this.vm.reload$.next();
  }

  ionViewWillLeave() {}
  ngOnDestroy() {}
}
```

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter {
  ionViewWillEnter() {}

  trackById(_index: number, item: { id: number }) {
    return item.id;
  }

  customHook() {}
}
```

```json
{
  "rules": {
    "@rdlabo/rules/no-component-method-except-lifecycle": [
      "error",
      {
        "additionalAllowedMethods": ["trackById", "customHook"]
      }
    ]
  }
}
```

## Options

```json
{
  "rules": {
    "@rdlabo/rules/no-component-method-except-lifecycle": [
      "error",
      {
        "additionalAllowedMethods": []
      }
    ]
  }
}
```

### `additionalAllowedMethods`

- Type: `string[]`
- Default: `[]`

Method names that are allowed in addition to lifecycle methods. Use this for helper methods such as `trackById` that are part of the Component template contract.

## When to enable

Enable this rule when a project wants Components to stay thin and push logic to ViewModels. It pairs with [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md).

## See also

- [`@rdlabo/rules/require-viewmodel`](./require-viewmodel.md)

## Implementation

- [Rule source](../../src/rules/no-component-method-except-lifecycle.ts)
- [Test source](../../tests/rules/no-component-method-except-lifecycle.ts)
