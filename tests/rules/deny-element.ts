import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/deny-element';

new TSESLint.RuleTester().run('deny-element', rule, {
  valid: [
    {
      code: '<div></div>',
      filename: 'template.html',
      parser: require.resolve('@angular-eslint/template-parser'),
      options: [{ elements: ['element'] }],
    },
  ],
  invalid: [
    {
      code: '<element></element>',
      filename: 'template.html',
      parser: require.resolve('@angular-eslint/template-parser'),
      errors: [{ messageId: 'denyElement' }],
      options: [{ elements: ['element'] }],
    },
  ],
});
