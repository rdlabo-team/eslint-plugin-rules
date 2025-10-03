# @rdlabo/rules/deny-import-from-ionic-module

> This plugin prevents accidental imports from @ionic/angular instead of @ionic/angular/standalone.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Mixing imports from `@ionic/angular` and `@ionic/angular/standalone` can cause runtime issues. While the build process may succeed, the application might fail when running in the browser. This rule helps prevent such issues by enforcing consistent import paths.

## Rule Details

❌ Incorrect: Importing from `@ionic/angular`

```ts
import { ModalController } from '@ionic/angular';
```

✅ Correct: Importing from `@ionic/angular/standalone`

```ts
import { ModalController } from '@ionic/angular/standalone';
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/deny-import-from-ionic-module.ts)
- [Test source](../../tests/rules/deny-import-from-ionic-module.ts)
