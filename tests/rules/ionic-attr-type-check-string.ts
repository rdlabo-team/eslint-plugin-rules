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
    // labelPlacement属性のテスト
    {
      code: '<ion-radio labelPlacement="{{labelPlacement}}"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio [labelPlacement]="labelPlacement"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio labelPlacement="start"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio labelPlacement="end"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio labelPlacement="fixed"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio labelPlacement="stacked"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-range labelPlacement="start"></ion-range>',
      filename: 'test.html',
    },
    {
      code: '<ion-toggle labelPlacement="end"></ion-toggle>',
      filename: 'test.html',
    },
    // alignment属性のテスト
    {
      code: '<ion-radio alignment="start"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio alignment="center"></ion-radio>',
      filename: 'test.html',
    },
    // justify属性のテスト
    {
      code: '<ion-select justify="start"></ion-select>',
      filename: 'test.html',
    },
    {
      code: '<ion-select justify="end"></ion-select>',
      filename: 'test.html',
    },
    {
      code: '<ion-select justify="space-between"></ion-select>',
      filename: 'test.html',
    },
    // shape属性のテスト（ion-buttonは'round'のみ）
    {
      code: '<ion-button shape="round"></ion-button>',
      filename: 'test.html',
    },
    // size属性のテスト（ion-fab-buttonは'small'のみ）
    {
      code: '<ion-fab-button size="small"></ion-fab-button>',
      filename: 'test.html',
    },
    // mode属性のテスト
    {
      code: '<ion-button mode="ios"></ion-button>',
      filename: 'test.html',
    },
    {
      code: '<ion-button mode="md"></ion-button>',
      filename: 'test.html',
    },
    // SegmentValue型のテスト（string | number）
    {
      code: '<ion-segment-button value="my"></ion-segment-button>',
      filename: 'test.html',
    },
    {
      code: '<ion-segment-button value="123"></ion-segment-button>',
      filename: 'test.html',
    },
    // Side型のテスト（'start' | 'end'）
    {
      code: '<ion-item-options side="start"></ion-item-options>',
      filename: 'test.html',
    },
    {
      code: '<ion-item-options side="end"></ion-item-options>',
      filename: 'test.html',
    },
    // nullやundefinedの値はエラーにならない
    {
      code: '<ion-item lines="null"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-item lines="undefined"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio labelPlacement="null"></ion-radio>',
      filename: 'test.html',
    },
    {
      code: '<ion-radio labelPlacement="undefined"></ion-radio>',
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
    // ion-cardのtarget属性（HTML標準属性）
    {
      code: '<ion-card target="_blank" [button]="true"></ion-card>',
      filename: 'test.html',
    },
  ],
  invalid: [
    // 無効な文字列リテラル値のテストケース
    {
      code: '<ion-item lines="invalid"></ion-item>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'lines',
            value: 'invalid',
            correctValue: 'full, inset, none',
          },
        },
      ],
    },
    {
      code: '<ion-item lines="wrong"></ion-item>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'lines',
            value: 'wrong',
            correctValue: 'full, inset, none',
          },
        },
      ],
    },
    {
      code: '<ion-item lines="true"></ion-item>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'lines',
            value: 'true',
            correctValue: 'full, inset, none',
          },
        },
      ],
    },
    // labelPlacement属性の無効な値
    {
      code: '<ion-radio labelPlacement="invalid"></ion-radio>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'labelPlacement',
            value: 'invalid',
            correctValue: 'start, end, fixed, stacked',
          },
        },
      ],
    },
    {
      code: '<ion-checkbox labelPlacement="center"></ion-checkbox>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'labelPlacement',
            value: 'center',
            correctValue: 'start, end, fixed, stacked',
          },
        },
      ],
    },
    // alignment属性の無効な値
    {
      code: '<ion-radio alignment="invalid"></ion-radio>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'alignment',
            value: 'invalid',
            correctValue: 'start, center',
          },
        },
      ],
    },
    {
      code: '<ion-radio alignment="end"></ion-radio>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'alignment',
            value: 'end',
            correctValue: 'start, center',
          },
        },
      ],
    },
    // justify属性の無効な値
    {
      code: '<ion-select justify="invalid"></ion-select>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'justify',
            value: 'invalid',
            correctValue: 'start, end, space-between',
          },
        },
      ],
    },
    {
      code: '<ion-select justify="center"></ion-select>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'justify',
            value: 'center',
            correctValue: 'start, end, space-between',
          },
        },
      ],
    },
    // プロパティバインディングでの無効な値
    {
      code: '<ion-radio [labelPlacement]="\'invalid\'"></ion-radio>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'labelPlacement',
            value: 'invalid',
            correctValue: 'start, end, fixed, stacked',
          },
        },
      ],
    },
    {
      code: '<ion-radio [labelPlacement]="\'center\'"></ion-radio>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'labelPlacement',
            value: 'center',
            correctValue: 'start, end, fixed, stacked',
          },
        },
      ],
    },
    {
      code: '<ion-item [lines]="\'wrong\'"></ion-item>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'lines',
            value: 'wrong',
            correctValue: 'full, inset, none',
          },
        },
      ],
    },
    {
      code: '<ion-select [justify]="\'center\'"></ion-select>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'justify',
            value: 'center',
            correctValue: 'start, end, space-between',
          },
        },
      ],
    },
    {
      code: '<ion-radio [alignment]="\'end\'"></ion-radio>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'alignment',
            value: 'end',
            correctValue: 'start, center',
          },
        },
      ],
    },
    // プロパティバインディングでのshape属性の無効な値
    {
      code: '<ion-button [shape]="\'invalid\'"></ion-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'shape',
            value: 'invalid',
            correctValue: 'round',
          },
        },
      ],
    },
    // プロパティバインディングでのsize属性の無効な値
    {
      code: '<ion-fab-button [size]="\'medium\'"></ion-fab-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'size',
            value: 'medium',
            correctValue: 'small',
          },
        },
      ],
    },
    // プロパティバインディングでのmode属性の無効な値
    {
      code: '<ion-button [mode]="\'android\'"></ion-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'mode',
            value: 'android',
            correctValue: 'ios, md',
          },
        },
      ],
    },
    // プロパティバインディングでのSide型の無効な値
    {
      code: '<ion-item-options [side]="\'invalid\'"></ion-item-options>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'side',
            value: 'invalid',
            correctValue: 'start, end',
          },
        },
      ],
    },
    {
      code: '<ion-item-options [side]="\'center\'"></ion-item-options>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'side',
            value: 'center',
            correctValue: 'start, end',
          },
        },
      ],
    },
    // shape属性の無効な値（ion-buttonは'round'のみ）
    {
      code: '<ion-button shape="invalid"></ion-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'shape',
            value: 'invalid',
            correctValue: 'round',
          },
        },
      ],
    },
    {
      code: '<ion-button shape="square"></ion-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'shape',
            value: 'square',
            correctValue: 'round',
          },
        },
      ],
    },
    // size属性の無効な値（ion-fab-buttonは'small'のみ）
    {
      code: '<ion-fab-button size="invalid"></ion-fab-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'size',
            value: 'invalid',
            correctValue: 'small',
          },
        },
      ],
    },
    {
      code: '<ion-fab-button size="medium"></ion-fab-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'size',
            value: 'medium',
            correctValue: 'small',
          },
        },
      ],
    },
    // mode属性の無効な値
    {
      code: '<ion-button mode="invalid"></ion-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'mode',
            value: 'invalid',
            correctValue: 'ios, md',
          },
        },
      ],
    },
    {
      code: '<ion-button mode="android"></ion-button>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'mode',
            value: 'android',
            correctValue: 'ios, md',
          },
        },
      ],
    },
    // Side型の無効な値
    {
      code: '<ion-item-options side="invalid"></ion-item-options>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'side',
            value: 'invalid',
            correctValue: 'start, end',
          },
        },
      ],
    },
    {
      code: '<ion-item-options side="center"></ion-item-options>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 1,
          data: {
            attributeType: 'string literal',
            attributeName: 'side',
            value: 'center',
            correctValue: 'start, end',
          },
        },
      ],
    },
    // 制御構文内での無効な値
    {
      code: `@if (showLines) {
        <ion-item lines="invalid"></ion-item>
      } @else {
        <ion-item lines="full"></ion-item>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'lines',
            value: 'invalid',
            correctValue: 'full, inset, none',
          },
        },
      ],
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-item lines="wrong"></ion-item>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'lines',
            value: 'wrong',
            correctValue: 'full, inset, none',
          },
        },
      ],
    },
    {
      code: `@if (showRadio) {
        <ion-radio labelPlacement="invalid"></ion-radio>
      } @else {
        <ion-radio labelPlacement="start"></ion-radio>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'labelPlacement',
            value: 'invalid',
            correctValue: 'start, end, fixed, stacked',
          },
        },
      ],
    },
    {
      code: `@if (showRadio) {
        <ion-radio [labelPlacement]="'invalid'"></ion-radio>
      } @else {
        <ion-radio [labelPlacement]="'start'"></ion-radio>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'labelPlacement',
            value: 'invalid',
            correctValue: 'start, end, fixed, stacked',
          },
        },
      ],
    },
    {
      code: `@for (item of items; track item.id) {
        <ion-item [lines]="'wrong'"></ion-item>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'lines',
            value: 'wrong',
            correctValue: 'full, inset, none',
          },
        },
      ],
    },
    {
      code: `@if (showButton) {
        <ion-button shape="invalid"></ion-button>
      } @else {
        <ion-button shape="round"></ion-button>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'shape',
            value: 'invalid',
            correctValue: 'round',
          },
        },
      ],
    },
    {
      code: `@for (button of buttons; track button.id) {
        <ion-fab-button [size]="'medium'"></ion-fab-button>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'size',
            value: 'medium',
            correctValue: 'small',
          },
        },
      ],
    },
    // 制御構文内でのSide型の無効な値
    {
      code: `@if (showOptions) {
        <ion-item-options side="invalid"></ion-item-options>
      } @else {
        <ion-item-options side="start"></ion-item-options>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'side',
            value: 'invalid',
            correctValue: 'start, end',
          },
        },
      ],
    },
    {
      code: `@for (option of options; track option.id) {
        <ion-item-options [side]="'center'"></ion-item-options>
      }`,
      filename: 'test.html',
      errors: [
        {
          messageId: 'ionic-attr-type-check',
          line: 2,
          data: {
            attributeType: 'string literal',
            attributeName: 'side',
            value: 'center',
            correctValue: 'start, end',
          },
        },
      ],
    },
  ],
});
