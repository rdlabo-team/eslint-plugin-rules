# @rdlabo/rules/deny-constructor-di

> This plugin disallows Dependency Injection within the constructor.

This rule reports constructor parameter properties that are used for dependency injection, such as `constructor(private readonly auth: AuthService)`. Angular's `inject()` function is the modern way to request dependencies in standalone components and services. It avoids constructor boilerplate and makes DI explicit.

## Rule Details

The rule checks the constructor of classes and reports any parameter that is a `TSParameterProperty` (a parameter with a modifier like `public`, `private`, or `readonly`). These are the parameters that become class fields and are used for DI.

- Plain constructor parameters without modifiers are allowed.
- The rule does not auto-fix; you must manually replace constructor DI with `inject()`.

## Examples

### Incorrect

```ts
@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  constructor(
    private store: Store<IApp>,
    public readonly navCtrl: NavController,
  ) {}
}
```

### Correct

```ts
import { inject } from '@angular/core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
})
export class SigninPage {
  private readonly store = inject(Store<IApp>);
  private readonly navCtrl = inject(NavController);
}
```

```ts
// Non-DI constructor parameters are allowed
export class LogManager {
  constructor(logDomain: string) {
    this.logDomain = logDomain;
  }
}
```

## Options

This rule has no options.

## When to enable

Enable this opt-in rule when a project requires Angular dependencies to be obtained with `inject()` instead of constructor parameter properties. Plain constructor parameters remain allowed because the rule only reports `TSParameterProperty` nodes.

## Implementation

- [Rule source](../../src/rules/deny-constructor-di.ts)
- [Test source](../../tests/rules/deny-constructor-di.ts)
