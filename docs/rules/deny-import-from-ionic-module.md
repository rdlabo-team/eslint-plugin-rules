# @rdlabo/rules/deny-import-from-ionic-module

> This plugin prevents accidental imports from @ionic/angular instead of @ionic/angular/standalone.
>
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Mixed use of @ionic/angular and @ionic/angular/standalone is not allowed. If this is the case, the build will not show any errors, but will not work without errors when running in a browser.

To prevent this, we prevent incorrect imports.

## Rule Details

Deny: import from `@ionic/angular`.

```ts
import { ModalController } from '@ionic/angular';
```

Allow: import from `@ionic/angular/standalone`.

```ts
import { ModalController } from '@ionic/angular/standalone';
```

## Options

No Options.

## Implementation

- [Rule source](../../src/rules/deny-import-from-ionic-module.ts)
- [Test source](../../tests/rules/deny-import-from-ionic-module.ts)
