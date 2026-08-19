# @rdlabo/eslint-plugin-rules

<!-- rdlabo-docs-omit -->

[![npm version](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules.svg)](https://badge.fury.io/js/%40rdlabo%2Feslint-plugin-rules)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- /rdlabo-docs-omit -->

Install the plugin as a development dependency:

```sh
npm install --save-dev @rdlabo/eslint-plugin-rules
```

The package root provides Angular and Ionic rules. Install `@angular-eslint/template-parser` and `@ionic/core` when you enable those rules. Framework-independent TypeScript projects can use the `/typescript` entry point without loading Angular or Ionic.

## Requirements

| Package                           | Supported version                 |
| --------------------------------- | --------------------------------- |
| Node.js                           | 20 or later                       |
| ESLint                            | 9 or later                        |
| `@typescript-eslint/utils`        | 8.33 or later, before 9           |
| `@angular-eslint/template-parser` | 21.x when template rules are used |
| `@ionic/core`                     | 8.x when Ionic rules are used     |

## Choose an entry point

- Use `@rdlabo/eslint-plugin-rules` for Angular and Ionic applications.
- Use `@rdlabo/eslint-plugin-rules/typescript` for backend and other framework-independent TypeScript projects.

The recommended preset is designed for ESLint Flat Config. Add it at the top level so its TypeScript and HTML file selectors remain intact.

## Next step

Continue to [Configuration](./docs/configuration.md) to enable the recommended preset or individual rules.

## Documentation

- [Configuration](./docs/configuration.md)
- [Rules](./docs/rules.md)

<!-- rdlabo-docs-omit -->

**Full documentation:** [https://docs.rdlabo.dev/projects/eslint-plugin-rules](https://docs.rdlabo.dev/projects/eslint-plugin-rules)

## Support This Project

Enjoying this project? Your support helps keep it alive and growing. Sponsoring means you directly contribute to new features, improvements, and maintenance.

[Become a Sponsor](https://github.com/sponsors/rdlabo)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
<!-- /rdlabo-docs-omit -->
