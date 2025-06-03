# @rdlabo/rules/deny-constructor-di

> This plugin disallows Dependency Injection within the constructor.

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
