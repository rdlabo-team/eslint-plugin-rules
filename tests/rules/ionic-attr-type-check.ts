import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/ionic-attr-type-check';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('ionic-attr-type-check (basic tests)', rule, {
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
      code: '<ion-progress-bar [value]="50"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-modal [isOpen]="true" [backdropDismiss]="false"></ion-modal>',
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
  ],
  invalid: [
    // boolean属性の文字列値
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
    // number属性の文字列値
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
    // boolean属性の文字列値（isOpenとbackdropDismissはboolean型）
    {
      code: '<ion-modal isOpen="true" backdropDismiss="false"></ion-modal>',
      filename: 'test.html',
      output:
        '<ion-modal [isOpen]="true" [backdropDismiss]="false"></ion-modal>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'isOpen',
            value: 'true',
            correctValue: 'true',
          },
        },
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'boolean',
            attributeName: 'backdropDismiss',
            value: 'false',
            correctValue: 'false',
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
  ],
});
