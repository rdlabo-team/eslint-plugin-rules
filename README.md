# @rdlabo/eslint-plugin-rules

A collection of ESLint rules specifically designed for Angular applications. These rules help maintain code quality and enforce best practices in your Angular projects.

[![npm version](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules.svg)](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Compatibility

| Plugin version | Angular | Ionic Framework |
| :------------- | :------ | :-------------- |
| 22.x           | 21–22   | 9.x             |
| 21.x           | 21–22   | 8.x             |

Upgrading from 21.x? See the [migration guide](./docs/migration.md) for the Ionic 9 import, `IonicModule`, and template attribute changes.

## 💖 Support This Project

Enjoying this project? Your support helps keep it alive and growing!  
Sponsoring means you directly contribute to new features, improvements, and maintenance.

[Become a Sponsor →](https://github.com/sponsors/rdlabo)

## ✨ Features

- 🛡️ Enforces best practices for Angular development
- 🧩 Provides framework-independent TypeScript rules without Angular or Ionic dependencies
- 🔍 Prevents common anti-patterns
- 🎯 Improves code quality and maintainability

## 📦 Installation

```sh
npm install @rdlabo/eslint-plugin-rules --save-dev
```

> **Angular / Ionic note**: The package root exposes Angular and Ionic rules.
> Install `@angular-eslint/template-parser`, `@ionic/angular`, and `@ionic/core`
> when using those rules. Plugin 22 supports Angular ESLint 21 and 22 with Ionic 9. Projects using `/typescript` do not need the Angular or Ionic packages.

## ⚙️ Configuration

### Configuration (eslint.config.js)

```js
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
  },
  ...rdlabo.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: __dirname } },
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      // repo-specific overrides (selectors, restricted imports, etc.)
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
```

`rdlabo.configs.recommended` contains separate TypeScript and HTML configs. Keep
it at the top level as shown above; placing it inside a scoped `extends` causes
`typescript-eslint`'s config helper to replace its internal `files` selectors
and can enable TypeScript-only rules for Angular templates.

`rdlabo.configs.recommended` enables the fleet-common `@rdlabo/rules/*` preset:

- TypeScript: `signal-use-as-signal`, `signal-use-as-signal-template`, `prefer-ionic-standalone`, `implements-ionic-lifecycle`, `deny-soft-private-modifier`, `deny-overlay-create`, `prefer-modal-launcher`, `require-viewmodel`, `component-property-use-readonly` (`ignorePrivateProperties: true`), `no-component-method-except-lifecycle`, `restrict-try-block` (`allowPromise: false`, `allowPromiseResolve: false`, `allowRxjs: false`, `allowInSignal: false`, `maxLines: 3`)
- Templates: `ionic-attr-type-check`, `deny-element` (common Ionic overlay tags), `prefer-disable-handler`

`deny-constructor-di` is **not** included (deprecated; prefer Angular `inject()` migration).

### Framework-independent TypeScript entry point

Use `@rdlabo/eslint-plugin-rules/typescript` for Node.js services, workers,
shared libraries, CLI tools, and other TypeScript projects that do not use
Angular or Ionic. This entry point is deliberately isolated from the package
root: importing it does not load Angular's template parser, Ionic component
metadata, or any Angular/Ionic-specific rule.

| Import                                   | Intended project                 | Exports                                                                 |
| :--------------------------------------- | :------------------------------- | :---------------------------------------------------------------------- |
| `@rdlabo/eslint-plugin-rules`            | Angular and Ionic applications   | All rules and `configs.recommended`                                     |
| `@rdlabo/eslint-plugin-rules/typescript` | Framework-independent TypeScript | `deny-soft-private-modifier` and `restrict-try-block`; no preset config |

#### Installation

For a standalone ESLint 9 + TypeScript setup:

```sh
npm install --save-dev @eslint/js eslint typescript typescript-eslint @rdlabo/eslint-plugin-rules
```

The `/typescript` entry point still uses `@typescript-eslint` parser services,
but it does not require `@angular-eslint/template-parser` or `@ionic/core`.

#### Complete Flat Config example

The entry point has no `configs.recommended` preset. Register the plugin and
enable the rules explicitly so each non-Angular project can choose its error
boundary policy.

```js
// eslint.config.mjs
import eslint from '@eslint/js';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const configRoot = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: configRoot,
    },
  },
  plugins: {
    '@rdlabo/rules': rdlabo,
  },
  rules: {
    '@rdlabo/rules/deny-soft-private-modifier': 'error',
    '@rdlabo/rules/restrict-try-block': [
      'error',
      {
        allowPromise: false,
        allowPromiseResolve: false,
        allowRxjs: false,
        allowInSignal: false,
        maxLines: 3,
      },
    ],
  },
});
```

For a CommonJS config, load the same entry point with `require()` and use
`__dirname` as the TypeScript config root:

```js
// eslint.config.cjs
const rdlabo = require('@rdlabo/eslint-plugin-rules/typescript');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config({
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: __dirname },
  },
  plugins: { '@rdlabo/rules': rdlabo },
  rules: {
    '@rdlabo/rules/deny-soft-private-modifier': 'error',
    '@rdlabo/rules/restrict-try-block': 'error',
  },
});
```

#### Exported rules

##### `deny-soft-private-modifier`

Replaces TypeScript's compile-time-only `private` modifier on named class
properties and methods with JavaScript hard-private `#` fields. References such
as `this.value` are updated to `this.#value` by `eslint --fix`. Constructors are
not reported.

```ts
class TokenStore {
  // incorrect: TypeScript soft private
  private token = '';

  // correct: JavaScript hard private
  #expiresAt = 0;
}
```

This rule has no options and is auto-fixable. See
[`deny-soft-private-modifier`](./docs/rules/deny-soft-private-modifier.md) for
the complete behavior.

##### `restrict-try-block`

Keeps `try` blocks as small synchronous exception boundaries. With its default
options, it reports:

- `await` and Promise-like expressions inside a `try` body
- RxJS-backed expressions inside a `try` body
- `try` inside an Angular `computed()` or `effect()` callback when those APIs
  happen to be used in otherwise shared TypeScript code
- more than three physical code lines in a `try` body
- calls to the unshadowed global `Promise.resolve()` anywhere in the file

```ts
// incorrect: a Promise rejection should use its own error boundary
try {
  await saveRecord();
} catch (error) {
  handleError(error);
}

// correct: keep try for the synchronous operation that can throw
let record;
try {
  record = parseRecord(input);
} catch (error) {
  return handleInvalidRecord(error);
}
await saveRecord(record).catch(handleError);
```

All options are optional and default to the values shown below:

| Option                | Default | Effect when changed                                                               |
| :-------------------- | :------ | :-------------------------------------------------------------------------------- |
| `allowPromise`        | `false` | `true` allows `await` and Promise-like processing inside `try`                    |
| `allowPromiseResolve` | `false` | `true` disables the dedicated file-wide `Promise.resolve()` check                 |
| `allowRxjs`           | `false` | `true` allows RxJS values and operations inside `try`                             |
| `allowInSignal`       | `false` | `true` allows `try` inside imported Angular `computed()` and `effect()` callbacks |
| `maxLines`            | `3`     | Set a positive physical-line limit, or `false` to disable the size check          |

`allowPromiseResolve: true` only disables the dedicated file-wide check. A
`Promise.resolve()` inside `try` is still Promise-like processing, so that case
also requires `allowPromise: true`.

Typed linting (`projectService: true`, as in the example) is strongly
recommended. It enables detection of thenables and values whose types originate
from RxJS. Without type information, ESLint still checks syntax-visible cases
such as `await`, `Promise.resolve()`, signal callbacks, and `maxLines`, but it
cannot reliably identify every Promise-like or RxJS expression.

See [`restrict-try-block`](./docs/rules/restrict-try-block.md) for details about
nested execution boundaries, line counting, global shadowing, and RxJS type
detection.

#### Intentionally unavailable from `/typescript`

The entry point does not expose Angular Component, Signal, dependency
injection, Ionic, or template rules. It also does not expose
`configs.recommended`. Import the package root when those rules or the preset
are required. Keeping these exports separate lets backend packages lint without
installing or initializing Angular/Ionic runtime dependencies.

### Manual rule list (without recommended)

```js
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: __dirname } },
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
    rules: {
      '@rdlabo/rules/prefer-ionic-standalone': 'error',
      '@rdlabo/rules/deny-overlay-create': 'error',
      '@rdlabo/rules/prefer-modal-launcher': 'error',
      '@rdlabo/rules/require-viewmodel': 'error',
      '@rdlabo/rules/no-component-method-except-lifecycle': 'error',
      '@rdlabo/rules/implements-ionic-lifecycle': 'error',
      '@rdlabo/rules/deny-soft-private-modifier': 'error',
      '@rdlabo/rules/signal-use-as-signal': 'error',
      '@rdlabo/rules/signal-use-as-signal-template': 'error',
      '@rdlabo/rules/component-property-use-readonly': ['error', { ignorePrivateProperties: true }],
      '@rdlabo/rules/restrict-try-block': ['error', { allowPromise: false, allowPromiseResolve: false, allowRxjs: false, allowInSignal: false, maxLines: 3 }],
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
    rules: {
      '@rdlabo/rules/deny-element': [
        'error',
        {
          elements: ['ion-modal', 'ion-toast', 'ion-alert', 'ion-loading', 'ion-picker', 'ion-action-sheet'],
        },
      ],
      '@rdlabo/rules/ionic-attr-type-check': 'error',
    },
  },
);
```

## 📋 Available Rules

<!--RULE_TABLE_BEGIN-->

| Rule                                                                                                       | Description                                                                                                                                                       | Auto-fixable |
| :--------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------: |
| [@rdlabo/rules/component-property-use-readonly](./docs/rules/component-property-use-readonly.md)           | Warns when a property should be readonly                                                                                                                          |      ✅      |
| [@rdlabo/rules/deny-constructor-di](./docs/rules/deny-constructor-di.md)                                   | This plugin disallows Dependency Injection within the constructor.                                                                                                |      ❌      |
| [@rdlabo/rules/deny-element](./docs/rules/deny-element.md)                                                 | This plugin disallows the use of certain HTML tags.                                                                                                               |      ❌      |
| [@rdlabo/rules/prefer-ionic-standalone](./docs/rules/prefer-ionic-standalone.md)                           | Prefer Ionic 9 standalone imports and disallow `IonicModule`.                                                                                                     |      ✅      |
| [@rdlabo/rules/deny-overlay-create](./docs/rules/deny-overlay-create.md)                                   | Disallow `.create()` on ModalController / PopoverController; open overlays via launchers instead.                                                                 |      ❌      |
| [@rdlabo/rules/deny-soft-private-modifier](./docs/rules/deny-soft-private-modifier.md)                     | This plugin disallows the use of soft private modifier.                                                                                                           |      ✅      |
| [@rdlabo/rules/implements-ionic-lifecycle](./docs/rules/implements-ionic-lifecycle.md)                     | This plugin recommend to implements Ionic Lifecycle.                                                                                                              |      ✅      |
| [@rdlabo/rules/ionic-attr-type-check](./docs/rules/ionic-attr-type-check.md)                               | Disallows string values for non-string attributes in Ionic components and suggests proper property binding. Supports boolean, number, and object type attributes. |      ✅      |
| [@rdlabo/rules/no-component-method-except-lifecycle](./docs/rules/no-component-method-except-lifecycle.md) | Disallow non-lifecycle methods on `@Component`. Allowed lifecycle methods are derived from `implements` (properties are allowed).                                 |      ❌      |
| [@rdlabo/rules/no-component-writable-signal](./docs/rules/no-component-writable-signal.md)                 | Keep writable component state in ViewModel, except models passed to Angular Signal Forms `form()`.                                                                |      ❌      |
| [@rdlabo/rules/no-reactive-forms](./docs/rules/no-reactive-forms.md)                                       | Disallow Angular Reactive Forms in favor of Signal Forms.                                                                                                         |      ❌      |
| [@rdlabo/rules/no-template-driven-forms](./docs/rules/no-template-driven-forms.md)                         | Disallow template-driven forms except `ngModel` bindings on explicitly allowed elements.                                                                          |      ❌      |
| [@rdlabo/rules/prefer-disable-handler](./docs/rules/prefer-disable-handler.md)                             | Require a wrapper method (default: disableHandler($event, work)) on configured element/event bindings to prevent double taps while async work runs                |      ❌      |
| [@rdlabo/rules/prefer-modal-launcher](./docs/rules/prefer-modal-launcher.md)                               | Require `presentModal` calls to live inside a `launch*` launcher function.                                                                                        |      ❌      |
| [@rdlabo/rules/require-viewmodel](./docs/rules/require-viewmodel.md)                                       | Enforce Component `new ViewModel(this)`, `ViewModelStore<ComponentType, Keys>` inheritance, and keep View APIs off ViewModel.                                     |      ❌      |
| [@rdlabo/rules/restrict-try-block](./docs/rules/restrict-try-block.md)                                     | Restrict Promise, RxJS, Angular Signal contexts, `Promise.resolve()` escape hatches, and physical code lines inside try blocks.                                   |      ❌      |
| [@rdlabo/rules/signal-use-as-signal-template](./docs/rules/signal-use-as-signal-template.md)               | Require () when accessing Angular Signals in templates                                                                                                            |      ❌      |
| [@rdlabo/rules/signal-use-as-signal](./docs/rules/signal-use-as-signal.md)                                 | This plugin check to valid signal use as signal.                                                                                                                  |      ✅      |

<!--RULE_TABLE_END-->

## 🔧 Recommended Additional Rules

### TypeScript Member Accessibility

Control the usage of explicit accessibility modifiers in class members:

```js
"rules": {
  "@typescript-eslint/explicit-member-accessibility": ["error", { "accessibility": "no-public" }],
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
