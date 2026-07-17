# @rdlabo/rules/no-component-method-except-lifecycle

> Disallow non-lifecycle methods on `@Component`. Allowed lifecycle methods are derived from `implements` (properties are allowed).
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.

Keep `@Component` classes thin. Behavior belongs on `ViewModel` (or modal `launch*` helpers).

Allowed **methods** are only those that match lifecycle interfaces listed in `implements`. A lifecycle method without the corresponding interface is also an error.

**Properties are out of scope**, including arrow-function fields such as `readonly open = () => ...`. Getters / setters and `constructor` are allowed.

`@Directive` / `@Injectable` / plain classes are not checked. Pair with `@rdlabo/rules/require-viewmodel` and `@rdlabo/rules/implements-ionic-lifecycle`.

> Existing apps often have many Component methods. Prefer starting with `"warn"`, then move logic to ViewModel before flipping to `"error"`.

## Rule Details

✅ Correct: methods match `implements`

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter, ViewWillLeave, OnDestroy {
  readonly vm = new ViewModel(this);
  readonly open = () => launchOtherPage(this.helper, {});

  constructor() {}

  ionViewWillEnter() {
    this.vm.reload$.next();
  }

  ionViewWillLeave() {}

  ngOnDestroy() {}
}
```

❌ Incorrect: lifecycle method without `implements`

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage {
  ionViewWillEnter() {} // error — needs implements ViewWillEnter
  ngOnDestroy() {} // error — needs implements OnDestroy
}
```

❌ Incorrect: implemented interface does not cover the method

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter {
  ionViewWillEnter() {}
  ionViewWillLeave() {} // error — needs implements ViewWillLeave
}
```

❌ Incorrect: arbitrary methods on Component

```ts
@Component({ selector: 'app-example', template: '' })
export class ExamplePage implements ViewWillEnter {
  ionViewWillEnter() {}

  open() {
    // error
    launchOtherPage(this.helper, {});
  }
}
```

## Interface → method mapping

### Angular

| `implements`          | method                  |
| --------------------- | ----------------------- |
| `OnChanges`           | `ngOnChanges`           |
| `OnInit`              | `ngOnInit`              |
| `DoCheck`             | `ngDoCheck`             |
| `AfterContentInit`    | `ngAfterContentInit`    |
| `AfterContentChecked` | `ngAfterContentChecked` |
| `AfterViewInit`       | `ngAfterViewInit`       |
| `AfterViewChecked`    | `ngAfterViewChecked`    |
| `OnDestroy`           | `ngOnDestroy`           |

### Ionic

| `implements`     | method              |
| ---------------- | ------------------- |
| `ViewWillEnter`  | `ionViewWillEnter`  |
| `ViewDidEnter`   | `ionViewDidEnter`   |
| `ViewWillLeave`  | `ionViewWillLeave`  |
| `ViewDidLeave`   | `ionViewDidLeave`   |
| `ViewWillUnload` | `ionViewWillUnload` |

Also allowed (not reported): `constructor`, `get` / `set` accessors, and all properties.

## Options

```ts
{
  // Extra method names to allow (e.g. trackBy helpers during migration).
  additionalAllowedMethods?: string[];
}
```

```js
'@rdlabo/rules/no-component-method-except-lifecycle': [
  'warn',
  { additionalAllowedMethods: ['trackById'] },
],
```

## Implementation

- [Rule source](../../src/rules/no-component-method-except-lifecycle.ts)
- [Test source](../../tests/rules/no-component-method-except-lifecycle.ts)
