// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config({
  files: ['**/*.ts'],
  ignores: ['!.*.js', '/node_modules', '/dist', '/scripts'],
  extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic],
  rules: {},
});
