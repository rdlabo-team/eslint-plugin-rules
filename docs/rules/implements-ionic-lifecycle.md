# @rdlabo/rules/implements-ionic-lifecycle

> This plugin checks the implementation of the Ionic lifecycle.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## Rule Details

Deny: Use Ionic Lifecycle within implements.

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

Allow: Use Ionic Lifecycle with implements.

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
