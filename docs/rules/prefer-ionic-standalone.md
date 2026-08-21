# @rdlabo/rules/prefer-ionic-standalone

> Prefer the Ionic 9 standalone API and disallow IonicModule and obsolete or NgModule-based entry points.
>
> - ⭐️ This rule is included in `plugin:@rdlabo/rules/recommended` preset.
> - ✒️ The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Ionic 9 exports standalone Angular components from `@ionic/angular`. This rule keeps applications on that API surface by rejecting the obsolete `@ionic/angular/standalone` entry point, the NgModule-based `@ionic/angular/lazy` entry point, and `IonicModule` itself.

## Examples

### Incorrect

```ts
import { IonButton } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/lazy';
import { IonicModule } from '@ionic/angular';
```

### Correct

```ts
import { IonButton, IonInput, ModalController, provideIonicAngular } from '@ionic/angular';
```

Named imports and named re-exports from `/standalone` and `/lazy` are auto-fixed to `@ionic/angular`, preserving the original quote style. Side-effect imports, namespace imports, and `export *` declarations are reported without a fix because changing their entry point may change runtime behavior. `IonicModule` is also reported without a fix because replacing `IonicModule.forRoot()` and NgModule metadata requires application-level changes.

Imports and re-exports are checked, including `Ionic.IonicModule` access through a namespace import.

## Options

This rule has no options. Configure its severity as `warn` or `error` in ESLint configuration.

## Implementation

- [Rule source](../../src/rules/prefer-ionic-standalone.ts)
- [Test source](../../tests/rules/prefer-ionic-standalone.ts)
