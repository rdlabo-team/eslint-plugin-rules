# @rdlabo/rules/implements-ionic-lifecycle

> This plugin recommend to implements Ionic Lifecycle.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Ionic provides framework-level lifecycle methods such as `ionViewWillEnter` and `ionViewDidLeave`. When a Component declares these methods, it should also implement the corresponding interface (`ViewWillEnter`, `ViewDidEnter`, `ViewWillLeave`, `ViewDidLeave`) so TypeScript can type-check the contract. This rule enforces that pairing and can auto-fix the `implements` clause.

## Rule Details

This rule checks `@Component` decorated classes. It looks for method definitions named after Ionic lifecycle methods:

- `ionViewWillEnter` -> `ViewWillEnter`
- `ionViewDidEnter` -> `ViewDidEnter`
- `ionViewWillLeave` -> `ViewWillLeave`
- `ionViewDidLeave` -> `ViewDidLeave`

If a method is present and its matching interface is missing, the rule reports it. When fixing a missing interface, the rule replaces the entire `implements` clause with the Ionic lifecycle interfaces that correspond to the used methods. This can remove unrelated interfaces such as `OnInit`, so review the fix and restore any non-Ionic interfaces that the class still requires. If every required interface is already present, extra lifecycle interfaces are not reported or removed.

- The rule does not check non-Component classes.
- If the class body is empty but it implements lifecycle interfaces, the rule removes the stale `implements` clause.
- The rule only reports once per fixable group to avoid overlapping fixes.

## Examples

### Incorrect

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

### Correct

```ts
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewWillEnter, ViewWillLeave {
  ionViewWillEnter() {}
  ionViewWillLeave() {}
}
```

```ts
@Component({
  selector: 'app-scanner',
  standalone: true,
})
export class ScannerPage implements ViewDidEnter, ViewDidLeave {
  ionViewDidEnter() {}
  ionViewDidLeave() {}
}
```

## Options

This rule has no options.

## When to enable

Enable this rule in any Ionic Angular project. It helps keep the `implements` clause accurate when lifecycle methods are added, renamed, or removed, and it works well with `--fix`.

## Implementation

- [Rule source](../../src/rules/implements-ionic-lifecycle.ts)
- [Test source](../../tests/rules/implements-ionic-lifecycle.ts)
