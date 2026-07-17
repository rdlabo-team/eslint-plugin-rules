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
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
    rules: {
      '@rdlabo/rules/deny-constructor-di': 'error',
      '@rdlabo/rules/deny-import-from-ionic-module': 'error',
      '@rdlabo/rules/deny-overlay-create': 'error',
      '@rdlabo/rules/prefer-modal-launcher': 'error',
      '@rdlabo/rules/require-viewmodel': 'error',
      '@rdlabo/rules/no-component-method-except-lifecycle': 'error',
      '@rdlabo/rules/implements-ionic-lifecycle': 'error',
      '@rdlabo/rules/deny-soft-private-modifier': 'error',
      '@rdlabo/rules/signal-use-as-signal': 'error',
      '@rdlabo/rules/signal-use-as-signal-template': 'error',
      '@rdlabo/rules/component-property-use-readonly': 'error',
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
          elements: ['ion-modal', 'ion-popover', 'ion-toast', 'ion-alert', 'ion-loading', 'ion-picker', 'ion-action-sheet'],
        },
      ],
      '@rdlabo/rules/ionic-attr-type-check': 'error',
    },
  },
);
```

## 📋 Available Rules

| Rule                                                                                                     | Description                                                            | Auto-fixable |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | :----------: |
| [@rdlabo/rules/deny-constructor-di](docs/rules/deny-constructor-di.md)                                   | Prevents Dependency Injection within constructors                      |      ❌      |
| [@rdlabo/rules/deny-element](docs/rules/deny-element.md)                                                 | Restricts usage of specific HTML elements                              |      ❌      |
| [@rdlabo/rules/deny-import-from-ionic-module](docs/rules/deny-import-from-ionic-module.md)               | Prevents direct imports from `@ionic/angular`                          |      ✅      |
| [@rdlabo/rules/deny-overlay-create](docs/rules/deny-overlay-create.md)                                   | Disallows `.create()` on Modal/Popover controllers                     |      ❌      |
| [@rdlabo/rules/prefer-modal-launcher](docs/rules/prefer-modal-launcher.md)                               | Requires `presentModal` calls inside `launch*` launcher functions      |      ❌      |
| [@rdlabo/rules/require-viewmodel](docs/rules/require-viewmodel.md)                                       | Enforces Component `new ViewModel(this)` + ViewModel constraints       |      ❌      |
| [@rdlabo/rules/no-component-method-except-lifecycle](docs/rules/no-component-method-except-lifecycle.md) | Allow only lifecycle methods declared via `implements` on `@Component` |      ❌      |
| [@rdlabo/rules/implements-ionic-lifecycle](docs/rules/implements-ionic-lifecycle.md)                     | Ensures proper implementation of Ionic lifecycle hooks                 |      ✅      |
| [@rdlabo/rules/deny-soft-private-modifier](docs/rules/deny-soft-private-modifier.md)                     | Prevents usage of soft private modifiers                               |      ✅      |
| [@rdlabo/rules/signal-use-as-signal](docs/rules/signal-use-as-signal.md)                                 | Validates proper usage of Angular signals                              |      ✅      |
| [@rdlabo/rules/signal-use-as-signal-template](docs/rules/signal-use-as-signal-template.md)               | Enforces correct usage of Angular Signals in templates                 |      ❌      |
| [@rdlabo/rules/component-property-use-readonly](docs/rules/component-property-use-readonly.md)           | Enforces readonly modifier for class properties                        |      ✅      |
| [@rdlabo/rules/ionic-attr-type-check](docs/rules/ionic-attr-type-check.md)                               | Disallows string values for non-string attributes in Ionic components  |      ✅      |

`@rdlabo/rules/import-inject-object` is removed. This is because we removed the auto-fixable feature from `@rdlabo/rules/deny-constructor-di` due to concerns about its compatibility with the new `ng generate @angular/core:inject` command.

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
