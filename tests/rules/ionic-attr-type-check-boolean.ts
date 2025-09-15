import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/ionic-attr-type-check';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('ionic-attr-type-check (boolean attributes)', rule, {
  valid: [
    // 正しいプロパティバインディング
    {
      code: '<ion-item [button]="true"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item [disabled]="false"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item [button]="null"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item [disabled]="undefined"></ion-item>',
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
      code: '<ion-skeleton-text [animated]="true"></ion-skeleton-text>',
      filename: 'test.html',
    },
    {
      code: '<ion-skeleton-text [animated]="false"></ion-skeleton-text>',
      filename: 'test.html',
    },
    // 文字列型属性は文字列値でOK
    {
      code: '<ion-item lines="full"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-button color="primary">Click me</ion-button>',
      filename: 'test.html',
    },
    // 通常のHTML要素は対象外
    {
      code: '<div class="test">Regular HTML element</div>',
      filename: 'test.html',
    },
    // 存在しない属性は対象外
    {
      code: '<ion-item text="false"></ion-item>',
      filename: 'test.html',
    },
    // 制御構文内での正しい使用
    {
      code: `@if (example() === 1) {
        <img src="example.png" />
      } @else {
        <ion-skeleton-text [animated]="true"></ion-skeleton-text>
      }`,
      filename: 'test.html',
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-item [button]="item.isButton"></ion-item>
      }`,
      filename: 'test.html',
    },
  ],
  invalid: [
    // 文字列値でのboolean属性
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
    // 数値文字列でのboolean属性
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
      code: '<ion-button disabled="0"></ion-button>',
      filename: 'test.html',
      output: '<ion-button [disabled]="false"></ion-button>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'disabled',
            value: '0',
            correctValue: 'false',
          },
        },
      ],
    },
    // 値なしのboolean属性
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
    // その他の文字列値
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
      code: '<ion-button disabled="no"></ion-button>',
      filename: 'test.html',
      output: '<ion-button [disabled]="false"></ion-button>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'disabled',
            value: 'no',
            correctValue: 'false',
          },
        },
      ],
    },
    // プロパティバインディング内の文字列リテラル
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
    // 制御構文内での文字列値
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
    // 複数のboolean属性
    {
      code: '<ion-item button="true" disabled="false"></ion-item>',
      filename: 'test.html',
      output: '<ion-item [button]="true" [disabled]="false"></ion-item>',
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
  ],
});
