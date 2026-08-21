# Migration guide

## 21.x to 22.x

Version 22 targets Angular 21 and 22 with Ionic Framework 9. Ionic 8 applications must remain on version 21 of this plugin.

### Dependencies

Commit your application changes first, then run Ionic's official [`@ionic/migrate`](https://www.npmjs.com/package/@ionic/migrate) tool from the application root:

```sh
npx @ionic/migrate --dry-run
npx @ionic/migrate
```

The migrator detects the installed Ionic major, updates `@ionic/angular` and `@ionic/core` together, applies safe v8-to-v9 changes, and prints a checklist for changes that require manual decisions. Review and test its diff before continuing. Version 22 of this plugin supports Angular and Angular ESLint 21 through 22.

### Ionic Angular imports

Replace the removed `deny-import-from-ionic-module` rule with `prefer-ionic-standalone`:

```diff
- '@rdlabo/rules/deny-import-from-ionic-module': 'error'
+ '@rdlabo/rules/prefer-ionic-standalone': 'error'
```

For Angular applications, the official migrator moves existing NgModule imports from `@ionic/angular` to `@ionic/angular/lazy` and standalone imports from `@ionic/angular/standalone` to the package root. This preserves the application's current architecture during the framework upgrade.

For example, the migrator performs this safe standalone import rewrite automatically:

```diff
- import { IonButton } from '@ionic/angular/standalone';
+ import { IonButton } from '@ionic/angular';
```

This plugin supports only Ionic 9 standalone applications. The official migrator reports `IonicModule` without an autofix because converting an NgModule application requires architectural decisions. After running it, complete the Angular standalone migration and import Ionic components from the package root. Do not mechanically replace `@ionic/angular/lazy` paths: first convert each NgModule consumer to standalone, then replace `IonicModule` with the specific Ionic components it uses.

The new rule rejects the NgModule-based `@ionic/angular/lazy` entry point and `IonicModule`. Migrate to standalone bootstrap with `provideIonicAngular()` and import standalone Ionic components directly:

```diff
- platformBrowserDynamic().bootstrapModule(AppModule);
+ bootstrapApplication(AppComponent, {
+   providers: [provideIonicAngular(config)],
+ });
```

Import `provideIonicAngular` from `@ionic/angular`. Complete the Angular NgModule-to-standalone migration before removing `IonicModule`; it cannot be replaced safely inside an NgModule with a one-line autofix.

### Boolean autocorrect

Ionic 9 changes `autocorrect` on `ion-input` and `ion-searchbar` from `'on' | 'off'` to `boolean`. The `ionic-attr-type-check` rule now fixes the old string form:

```diff
- <ion-input autocorrect="off"></ion-input>
+ <ion-input [autocorrect]="false"></ion-input>
```

The official Ionic migrator handles this v8-to-v9 change automatically. The rule remains useful for detecting old or newly introduced string values after migration and reads Ionic 9 component types, so it also follows other property type and accepted-value changes exposed by those definitions. Run ESLint with `--fix`, review the resulting template changes, and then run the Angular build and tests before committing.
