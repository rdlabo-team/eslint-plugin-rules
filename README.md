# @rdlabo/eslint-plugin-rules

A collection of ESLint rules specifically designed for Angular applications. These rules help maintain code quality and enforce best practices in your Angular projects.

[![npm version](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules.svg)](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 💖 Support This Project

Enjoying this project? Your support helps keep it alive and growing!  
Sponsoring means you directly contribute to new features, improvements, and maintenance.

[Become a Sponsor →](https://github.com/sponsors/rdlabo)

## ✨ Features

- 🛡️ Enforces best practices for Angular development
- 🔍 Prevents common anti-patterns
- 🎯 Improves code quality and maintainability

## 📦 Installation

```sh
npm install @rdlabo/eslint-plugin-rules --save-dev
```

> **Note**: If your project doesn't have `angular-eslint` packages installed, please install them first: [angular-eslint](https://github.com/angular-eslint/angular-eslint)

## ⚙️ Configuration

### Configuration (eslint.config.js)

```js
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      ...rdlabo.configs.recommended,
    ],
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
    processor: angular.processInlineTemplates,
    rules: {
      // repo-specific overrides (selectors, restricted imports, etc.)
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility, ...rdlabo.configs.recommended],
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
  },
);
```

`rdlabo.configs.recommended` enables the fleet-common `@rdlabo/rules/*` preset:

- TypeScript: `signal-use-as-signal`, `signal-use-as-signal-template`, `deny-import-from-ionic-module`, `implements-ionic-lifecycle`, `deny-soft-private-modifier`, `deny-overlay-create`, `prefer-modal-launcher`, `require-viewmodel`, `component-property-use-readonly` (`ignorePrivateProperties: true`), `no-component-method-except-lifecycle`, `restrict-try-block` (`allowPromise: false`, `allowRxjs: false`, `allowInSignal: false`, `maxLines: 3`)
- Templates: `ionic-attr-type-check`, `deny-element` (common Ionic overlay tags), `prefer-disable-handler`

`deny-constructor-di` is **not** included (deprecated; prefer Angular `inject()` migration).

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
      '@rdlabo/rules/deny-import-from-ionic-module': 'error',
      '@rdlabo/rules/deny-overlay-create': 'error',
      '@rdlabo/rules/prefer-modal-launcher': 'error',
      '@rdlabo/rules/require-viewmodel': 'error',
      '@rdlabo/rules/no-component-method-except-lifecycle': 'error',
      '@rdlabo/rules/implements-ionic-lifecycle': 'error',
      '@rdlabo/rules/deny-soft-private-modifier': 'error',
      '@rdlabo/rules/signal-use-as-signal': 'error',
      '@rdlabo/rules/signal-use-as-signal-template': 'error',
      '@rdlabo/rules/component-property-use-readonly': ['error', { ignorePrivateProperties: true }],
      '@rdlabo/rules/restrict-try-block': ['error', { allowPromise: false, allowRxjs: false, allowInSignal: false, maxLines: 3 }],
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
| [@rdlabo/rules/deny-import-from-ionic-module](./docs/rules/deny-import-from-ionic-module.md)               | This plugin prevents accidental imports from @ionic/angular instead of @ionic/angular/standalone.                                                                 |      ✅      |
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
| [@rdlabo/rules/restrict-try-block](./docs/rules/restrict-try-block.md)                                     | Restrict Promise, RxJS, Angular Signal contexts, and physical code lines inside try blocks.                                                                       |      ❌      |
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
