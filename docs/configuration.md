## Angular and Ionic

Register the plugin, spread its recommended configs at the top level, then add the standard Angular and TypeScript configs for your project.

```js
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const rdlabo = require('@rdlabo/eslint-plugin-rules');

module.exports = tseslint.config(
  {
    plugins: { '@rdlabo/rules': rdlabo },
  },
  ...rdlabo.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
```

Do not place `rdlabo.configs.recommended` inside a scoped `extends`. The `typescript-eslint` config helper would replace the preset's internal `files` selectors and could run TypeScript-only rules against templates.

## Framework-independent TypeScript

```js
import tseslint from 'typescript-eslint';
import rdlabo from '@rdlabo/eslint-plugin-rules/typescript';

export default tseslint.config({
  files: ['**/*.ts'],
  plugins: { '@rdlabo/rules': rdlabo },
  rules: {
    '@rdlabo/rules/deny-soft-private-modifier': 'error',
    '@rdlabo/rules/restrict-try-block': [
      'error',
      {
        allowPromise: false,
        allowPromiseResolve: true,
        allowRxjs: false,
        allowInSignal: false,
        maxLines: 3,
      },
    ],
  },
});
```

Typed linting is required for the full Promise and RxJS checks in `restrict-try-block`.

## Recommended preset

The preset enables the common Signal, component boundary, lifecycle, overlay, readonly, and try-block rules for TypeScript. Its HTML config enables Ionic attribute checking, denied overlay elements, and double-action prevention.

`deny-constructor-di` is deprecated and is not in the preset. Prefer Angular's `inject()` migration.
