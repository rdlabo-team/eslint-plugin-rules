# @rdlabo/rules/deny-constructor-di

> This plugin disallows Dependency Injection within the constructor.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

> This plugin disallows Dependency Injection within the constructor.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Rules for switching Dependency Injection from constructor to inject function.

## Rule Details

Deny: Dependency Injection within the constructor.

```ts
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class SigninPage {
  constructor(public platform: Platform) {}
}
```

Allow: Dependency Injection within the inject function.

```ts
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class SigninPage {
  public readonly platform = inject(Platform);

  constructor() {}
}
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/deny-constructor-di.ts)
- [Test source](../../tests/rules/deny-constructor-di.ts)
