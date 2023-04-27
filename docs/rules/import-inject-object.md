# @rdlabo/rules/import-inject-object

> This plugin automatically imports when Inject is used but not imported.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Rules for automatically importing when `inject` is used but not imported. Since `@rdlabo/rules/deny-constructor-di` alone could not auto fix the import statement, made the rule independent.

## Rule Details

Deny: use `inject` function, but not imported.

```ts
import { Component } from '@angular/core';
export class SigninPage {
  private navCtrl = inject(NavController);
  public helper = inject(HelperService);
}
```

Allow: use `inject` function, and imported.

```ts
import { Component, inject } from '@angular/core';
export class SigninPage {
  private navCtrl = inject(NavController);
  public helper = inject(HelperService);
}
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/import-inject-object.ts)
- [Test source](../../tests/rules/import-inject-object.ts)
