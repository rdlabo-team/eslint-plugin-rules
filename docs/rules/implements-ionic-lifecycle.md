# @rdlabo/rules/implements-ionic-lifecycle

> This plugin enforces the proper implementation of Ionic Lifecycle interfaces.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## Rule Details

❌ Incorrect: Using Ionic Lifecycle methods without implementing the interface

```ts
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class SigninPage {
  ionViewWillEnter() {}
}
```

✅ Correct: Using Ionic Lifecycle methods with proper interface implementation

```ts
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class SigninPage implements ionViewWillEnter {
  ionViewWillEnter() {}
}
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/implements-ionic-lifecycle.ts)
- [Test source](../../tests/rules/implements-ionic-lifecycle.ts)
