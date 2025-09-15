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
    {
      code: `@if (showModal) {
        <div>Content</div>
      } @else {
        <ion-button>Click me</ion-button>
      }`,
      filename: 'template.html',
      options: [{ elements: ['ion-modal', 'ion-popover'] }],
    },
    {
      code: `@for (item of items; track item.id) {
        <div>{{ item.name }}</div>
      }`,
      filename: 'template.html',
      options: [{ elements: ['ion-modal', 'ion-popover'] }],
    },
    {
      code: `@if (showModal) {
        <ion-button>Click me</ion-button>
      } @else {
        <ion-button>Another button</ion-button>
      }`,
      filename: 'template.html',
      options: [{ elements: ['ion-modal', 'ion-popover'] }],
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
    {
      code: `@if (showModal) {
        <ion-modal>Modal content</ion-modal>
      } @else {
        <div>No modal</div>
      }`,
      filename: 'template.html',
      errors: [{ messageId: 'denyElement', line: 2 }],
      options: [{ elements: ['ion-modal'] }],
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-popover>Popover content</ion-popover>
      }`,
      filename: 'template.html',
      errors: [{ messageId: 'denyElement', line: 2 }],
      options: [{ elements: ['ion-popover'] }],
    },
    {
      code: `@if (showToast) {
        <ion-toast>Toast message</ion-toast>
      } @else {
        <ion-alert>Alert message</ion-alert>
      }`,
      filename: 'template.html',
      errors: [
        { messageId: 'denyElement', line: 2 },
        { messageId: 'denyElement', line: 4 },
      ],
      options: [{ elements: ['ion-toast', 'ion-alert'] }],
    },
    {
      code: `@if (showModal) {
        <div>
          <ion-modal>Modal</ion-modal>
        </div>
      } @else {
        <ion-popover>Popover</ion-popover>
      }`,
      filename: 'template.html',
      errors: [
        { messageId: 'denyElement', line: 3 },
        { messageId: 'denyElement', line: 6 },
      ],
      options: [{ elements: ['ion-modal', 'ion-popover'] }],
    },
  ],
});
