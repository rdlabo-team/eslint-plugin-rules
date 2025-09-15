import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/ionic-attr-type-check';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('ionic-attr-type-check (string attributes)', rule, {
  valid: [
    // 正しい文字列値でのstring属性
    {
      code: '<ion-item lines="true"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item lines="full"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item lines="inset"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item lines="none"></ion-item>',
      filename: 'test.html',
    },
    // 正しいプロパティバインディングでのstring属性
    {
      code: '<ion-item [lines]="lineType"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item [lines]="\'full\'"></ion-item>',
      filename: 'test.html',
    },
    // 計算式を使用したプロパティバインディング
    {
      code: "<ion-item [lines]=\"isFull ? 'full' : 'inset'\"></ion-item>",
      filename: 'test.html',
    },
    // 制御構文内での正しい使用
    {
      code: `@if (showLines) {
        <ion-item lines="full"></ion-item>
      } @else {
        <ion-item lines="inset"></ion-item>
      }`,
      filename: 'test.html',
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-item [lines]="item.lines"></ion-item>
      }`,
      filename: 'test.html',
    },
    // 空文字列も有効
    {
      code: '<ion-item lines=""></ion-item>',
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
  ],
  invalid: [
    // string属性に対しては文字列値が正しいので、エラーは発生しない
    // このテストファイルでは、string属性が正しく認識され、
    // 文字列値で使用された場合にエラーが発生しないことを確認する
    // 注意: string型属性は文字列値で使用するのが正しいので、
    // 実際にはエラーが発生するケースは存在しない
    // このセクションは空のままにしておく
  ],
});
