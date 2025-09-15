import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/ionic-attr-type-check';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('ionic-attr-type-check (number attributes)', rule, {
  valid: [
    // 正しいプロパティバインディング
    {
      code: '<ion-progress-bar [value]="50"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-progress-bar [value]="null"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-progress-bar [value]="undefined"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-progress-bar [value]="0"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-progress-bar [value]="100"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-range [min]="0" [max]="100" [value]="50"></ion-range>',
      filename: 'test.html',
    },
    {
      code: '<ion-slides [pager]="true" [options]="{ slidesPerView: 3 }"></ion-slides>',
      filename: 'test.html',
    },
    // 変数を使用したプロパティバインディング
    {
      code: '<ion-progress-bar [value]="progressValue"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-range [value]="rangeValue" [min]="minValue" [max]="maxValue"></ion-range>',
      filename: 'test.html',
    },
    // 計算式を使用したプロパティバインディング
    {
      code: '<ion-progress-bar [value]="progress * 100"></ion-progress-bar>',
      filename: 'test.html',
    },
    {
      code: '<ion-range [value]="(min + max) / 2"></ion-range>',
      filename: 'test.html',
    },
    // 制御構文内での正しい使用
    {
      code: `@if (showProgress) {
        <ion-progress-bar [value]="progressValue"></ion-progress-bar>
      } @else {
        <div>No progress</div>
      }`,
      filename: 'test.html',
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-progress-bar [value]="item.progress"></ion-progress-bar>
      }`,
      filename: 'test.html',
    },
  ],
  invalid: [
    // 文字列値でのnumber属性
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
    {
      code: '<ion-progress-bar value="0"></ion-progress-bar>',
      filename: 'test.html',
      output: '<ion-progress-bar [value]="0"></ion-progress-bar>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'value',
            value: '0',
            correctValue: '0',
          },
        },
      ],
    },
    {
      code: '<ion-progress-bar value="100"></ion-progress-bar>',
      filename: 'test.html',
      output: '<ion-progress-bar [value]="100"></ion-progress-bar>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'value',
            value: '100',
            correctValue: '100',
          },
        },
      ],
    },
    // 小数点を含む数値
    {
      code: '<ion-progress-bar value="50.5"></ion-progress-bar>',
      filename: 'test.html',
      output: '<ion-progress-bar [value]="50.5"></ion-progress-bar>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'value',
            value: '50.5',
            correctValue: '50.5',
          },
        },
      ],
    },
    // 値なしのnumber属性
    {
      code: '<ion-progress-bar value></ion-progress-bar>',
      filename: 'test.html',
      output: '<ion-progress-bar [value]="0"></ion-progress-bar>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'value',
            value: '',
            correctValue: '0',
          },
        },
      ],
    },
    // 制御構文内での文字列値
    {
      code: `@if (showProgress) {
        <ion-progress-bar value="75"></ion-progress-bar>
      } @else {
        <div>No progress</div>
      }`,
      filename: 'test.html',
      output: `@if (showProgress) {
        <ion-progress-bar [value]="75"></ion-progress-bar>
      } @else {
        <div>No progress</div>
      }`,
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'number',
            attributeName: 'value',
            value: '75',
            correctValue: '75',
          },
        },
      ],
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-progress-bar value="50"></ion-progress-bar>
      }`,
      filename: 'test.html',
      output: `@for (item of items; track item.id) {
        <ion-progress-bar [value]="50"></ion-progress-bar>
      }`,
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'number',
            attributeName: 'value',
            value: '50',
            correctValue: '50',
          },
        },
      ],
    },
    // 複数のnumber属性
    {
      code: '<ion-range min="0" max="100" step="1"></ion-range>',
      filename: 'test.html',
      output: '<ion-range [min]="0" [max]="100" [step]="1"></ion-range>',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'min',
            value: '0',
            correctValue: '0',
          },
        },
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'max',
            value: '100',
            correctValue: '100',
          },
        },
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'number',
            attributeName: 'step',
            value: '1',
            correctValue: '1',
          },
        },
      ],
    },
  ],
});
