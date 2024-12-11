import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/deny-element';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('deny-element', rule, {
  valid: [
    {
      code: '<div></div>',
      filename: 'template.html',
      options: [{ elements: ['element'] }],
    },
  ],
  invalid: [
    {
      code: '<element></element>',
      filename: 'template.html',
      errors: [{ messageId: 'denyElement' }],
      options: [{ elements: ['element'] }],
    },
  ],
});
