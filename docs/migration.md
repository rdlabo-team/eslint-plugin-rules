# Migration guide

## 21.x to 22.x

Version 22 targets Angular 21 and 22 with Ionic Framework 9. Ionic 8 applications must remain on version 21 of this plugin.

### Dependencies

Update Ionic Angular and Core together so both packages use the same major:

```sh
npm install @ionic/angular@^9 @ionic/core@^9
```

Version 22 of this plugin supports Angular and Angular ESLint 21 through 22.

### Ionic Angular imports

Replace the removed `deny-import-from-ionic-module` rule with `prefer-ionic-standalone`:

```diff
- '@rdlabo/rules/deny-import-from-ionic-module': 'error'
+ '@rdlabo/rules/prefer-ionic-standalone': 'error'
```

Ionic 9 exports standalone components from the package root:

```diff
- import { IonButton } from '@ionic/angular/standalone';
+ import { IonButton } from '@ionic/angular';
```

The new rule also rejects the NgModule-based `@ionic/angular/lazy` entry point and `IonicModule`. Migrate to standalone bootstrap with `provideIonicAngular()` and import standalone Ionic components directly:

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

The rule reads Ionic 9 component types, so it also follows other property type and accepted-value changes exposed by those definitions. Run ESLint with `--fix`, review the resulting template changes, and then run the Angular build and tests before committing.
