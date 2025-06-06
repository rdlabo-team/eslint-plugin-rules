# @rdlabo/eslint-plugin-rules

[![npm version](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules.svg)](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of ESLint rules specifically designed for Ionic Angular applications. These rules help maintain code quality and enforce best practices in your Ionic Angular projects.

## ✨ Features

- 🛡️ Enforces best practices for Ionic Angular development
- 🔍 Prevents common anti-patterns
- 🎯 Improves code quality and maintainability
- ⚡ Supports both modern and legacy ESLint configurations

## 📦 Installation

```sh
npm install @rdlabo/eslint-plugin-rules --save-dev
```

> **Note**: If your project doesn't have `angular-eslint` packages installed, please install them first: [angular-eslint](https://github.com/angular-eslint/angular-eslint)

## ⚙️ Configuration

### Modern Configuration (eslint.config.js)

```js
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    files: ['*.ts'],
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
    rules: {
      '@rdlabo/rules/deny-constructor-di': 'error',
      '@rdlabo/rules/deny-import-from-ionic-module': 'error',
      '@rdlabo/rules/implements-ionic-lifecycle': 'error',
      '@rdlabo/rules/deny-soft-private-modifier': 'error',
      '@rdlabo/rules/signal-use-as-signal': 'error',
      '@rdlabo/rules/signal-use-as-signal-template': 'error',
      '@rdlabo/rules/component-property-use-readonly': 'error',
    },
  },
  {
    files: ['*.html'],
    plugins: {
      '@rdlabo/rules': rdlabo,
    },
    rules: {
      '@rdlabo/rules/deny-element': [
        'error',
        {
          elements: [
            'ion-modal',
            'ion-popover',
            'ion-toast',
            'ion-alert',
            'ion-loading',
            'ion-picker',
            'ion-action-sheet',
          ],
        },
      ],
    },
  }
);
```

## 📋 Available Rules

| Rule                                                                                           | Description                                            | Auto-fixable |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------ | :----------: |
| [@rdlabo/rules/deny-constructor-di](docs/rules/deny-constructor-di.md)                         | Prevents Dependency Injection within constructors      |      ❌      |
| [@rdlabo/rules/deny-element](docs/rules/deny-element.md)                                       | Restricts usage of specific HTML elements              |      ❌      |
| [@rdlabo/rules/deny-import-from-ionic-module](docs/rules/deny-import-from-ionic-module.md)     | Prevents direct imports from `@ionic/angular`          |      ✅      |
| [@rdlabo/rules/implements-ionic-lifecycle](docs/rules/implements-ionic-lifecycle.md)           | Ensures proper implementation of Ionic lifecycle hooks |      ✅      |
| [@rdlabo/rules/deny-soft-private-modifier](docs/rules/deny-soft-private-modifier.md)           | Prevents usage of soft private modifiers               |      ✅      |
| [@rdlabo/rules/signal-use-as-signal](docs/rules/signal-use-as-signal.md)                       | Validates proper usage of Angular signals              |      ✅      |
| [@rdlabo/rules/signal-use-as-signal-template](docs/rules/signal-use-as-signal-template.md)     | Enforces correct usage of Angular Signals in templates |      ❌      |
| [@rdlabo/rules/component-property-use-readonly](docs/rules/component-property-use-readonly.md) | Enforces readonly modifier for class properties        |      ✅      |

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
