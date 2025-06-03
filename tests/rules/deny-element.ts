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
    {
      code: '<div><p>Hello</p></div>',
      filename: 'template.html',
      options: [{ elements: ['ion-modal'] }],
    },
    {
      code: '<ion-button></ion-button>',
      filename: 'template.html',
      options: [{ elements: ['ion-modal', 'ion-popover'] }],
    },
    {
      code: '<div><ion-button></ion-button></div>',
      filename: 'template.html',
      options: [{ elements: ['ion-modal', 'ion-popover'] }],
    },
    {
      code: '<ion-modal></ion-modal>',
      filename: 'template.spec.html',
      options: [{ elements: ['ion-modal'] }],
    },
  ],
  invalid: [
    {
      code: '<element></element>',
      filename: 'template.html',
      errors: [{ messageId: 'denyElement', line: 1 }],
      options: [{ elements: ['element'] }],
    },
    {
      code: '<div><ion-modal></ion-modal></div>',
      filename: 'template.html',
      errors: [{ messageId: 'denyElement', line: 1 }],
      options: [{ elements: ['ion-modal'] }],
    },
    {
      code: '<ion-modal><ion-popover></ion-popover></ion-modal>',
      filename: 'template.html',
      errors: [
        { messageId: 'denyElement', line: 1 },
        { messageId: 'denyElement', line: 1 },
      ],
      options: [{ elements: ['ion-modal', 'ion-popover'] }],
    },
    {
      code: '<div><ion-toast></ion-toast><ion-alert></ion-alert></div>',
      filename: 'template.html',
      errors: [
        { messageId: 'denyElement', line: 1 },
        { messageId: 'denyElement', line: 1 },
      ],
      options: [{ elements: ['ion-toast', 'ion-alert'] }],
    },
    {
      code: '<ion-loading><div><ion-picker></ion-picker></div></ion-loading>',
      filename: 'template.html',
      errors: [
        { messageId: 'denyElement', line: 1 },
        { messageId: 'denyElement', line: 1 },
      ],
      options: [{ elements: ['ion-loading', 'ion-picker'] }],
    },
  ],
});
