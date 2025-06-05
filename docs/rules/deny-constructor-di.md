# @rdlabo/rules/deny-constructor-di

> This plugin enforces the use of the `inject` function for Dependency Injection instead of constructor injection.

This rule encourages modern Angular dependency injection practices by using the `inject` function.

## Rule Details

❌ Incorrect: Using constructor-based dependency injection

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

✅ Correct: Using the `inject` function for dependency injection

```ts
@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class SigninPage {
  public platform = inject(Platform);

  constructor() {}
}
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/deny-constructor-di.ts)
- [Test source](../../tests/rules/deny-constructor-di.ts)
