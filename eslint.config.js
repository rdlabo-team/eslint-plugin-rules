// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const plugin = require('./dist/index.js');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    ignores: ['!.*.js', '/node_modules', '/dist', '/scripts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    rules: {},
  },
  {
    files: ['**/*.html'],
    ignores: ['/node_modules', '/dist'],
    languageOptions: {
      parser: require('@angular-eslint/template-parser'),
    },
    plugins: {
      '@rdlabo/rules': plugin,
    },
    rules: {
      '@rdlabo/rules/no-string-boolean-ionic-attr': 'error',
    },
  }
);
