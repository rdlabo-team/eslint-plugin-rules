import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/ionic-attr-type-check';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('ionic-attr-type-check', rule, {
  valid: [
    {
      code: '<ion-item [button]="true"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item lines="true"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item lines="full"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item [disabled]="false"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-list [inset]="true"></ion-list>',
      filename: 'test.html',
    },
    {
      code: '<ion-button [disabled]="false"></ion-button>',
      filename: 'test.html',
    },
    {
      code: '<div class="test">Regular HTML element</div>',
      filename: 'test.html',
    },
    {
      // ない場合はどうなるかのチェック
      code: '<ion-item text="false"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-button color="primary">Click me</ion-button>',
      filename: 'test.html',
    },
    // オブジェクト型属性のテストケース（有効なケース）
    {
      code: '<ion-modal [isOpen]="true" [backdropDismiss]="false"></ion-modal>',
      filename: 'test.html',
    },
    {
      code: '<ion-skeleton-text [animated]="true"></ion-skeleton-text>',
      filename: 'test.html',
    },
    {
      code: '<ion-skeleton-text [animated]="false"></ion-skeleton-text>',
      filename: 'test.html',
    },
    {
      code: `@if (example() === 1) {
        <img src="example.png" />
      } @else {
        <ion-skeleton-text [animated]="true"></ion-skeleton-text>
      }`,
      filename: 'test.html',
    },
  ],
  invalid: [
    {
      code: '<ion-item button="true"></ion-item>',
      filename: 'test.html',
      output: '<ion-item [button]="true"></ion-item>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'button',
            value: 'true',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-item disabled="false"></ion-item>',
      filename: 'test.html',
      output: '<ion-item [disabled]="false"></ion-item>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'disabled',
            value: 'false',
            correctValue: 'false',
          },
        },
      ],
    },
    {
      code: '<ion-list inset="true"></ion-list>',
      filename: 'test.html',
      output: '<ion-list [inset]="true"></ion-list>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'inset',
            value: 'true',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-item button="1"></ion-item>',
      filename: 'test.html',
      output: '<ion-item [button]="true"></ion-item>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'button',
            value: '1',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-item button></ion-item>',
      filename: 'test.html',
      output: '<ion-item [button]="true"></ion-item>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'button',
            value: '',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-button disabled="yes"></ion-button>',
      filename: 'test.html',
      output: '<ion-button [disabled]="true"></ion-button>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'disabled',
            value: 'yes',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-item [button]="\'true\'"></ion-item>',
      filename: 'test.html',
      output: '<ion-item [button]="true"></ion-item>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'button',
            value: 'true',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-skeleton-text animated="true"></ion-skeleton-text>',
      filename: 'test.html',
      output: '<ion-skeleton-text [animated]="true"></ion-skeleton-text>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'animated',
            value: 'true',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-skeleton-text animated="false"></ion-skeleton-text>',
      filename: 'test.html',
      output: '<ion-skeleton-text [animated]="false"></ion-skeleton-text>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'animated',
            value: 'false',
            correctValue: 'false',
          },
        },
      ],
    },
    {
      code: '<ion-skeleton-text animated></ion-skeleton-text>',
      filename: 'test.html',
      output: '<ion-skeleton-text [animated]="true"></ion-skeleton-text>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'animated',
            value: '',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: '<ion-skeleton-text animated="1"></ion-skeleton-text>',
      filename: 'test.html',
      output: '<ion-skeleton-text [animated]="true"></ion-skeleton-text>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'animated',
            value: '1',
            correctValue: 'true',
          },
        },
      ],
    },
    {
      code: `@if (example() === 1) {
        <img src="example.png" />
      } @else {
        <ion-skeleton-text animated="true"></ion-skeleton-text>
      }`,
      filename: 'test.html',
      output: `@if (example() === 1) {
        <img src="example.png" />
      } @else {
        <ion-skeleton-text [animated]="true"></ion-skeleton-text>
      }`,
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 4,
          data: {
            attributeType: 'boolean',
            attributeName: 'animated',
            value: 'true',
            correctValue: 'true',
          },
        },
      ],
    },
    // 数値型属性のテストケース
    {
      code: '<ion-progress-bar value="50"></ion-progress-bar>',
      filename: 'test.html',
      output: '<ion-progress-bar [value]="50"></ion-progress-bar>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'value',
            value: '50',
            correctValue: '50',
          },
        },
      ],
    },
  ],
});
