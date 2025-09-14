import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/no-string-boolean-ionic-attr';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('no-string-boolean-ionic-attr', rule, {
  valid: [
    {
      code: '<ion-item [button]="true"></ion-item>',
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
      code: '<ion-item text="Hello World"></ion-item>',
      filename: 'test.html',
    },
    {
      code: '<ion-button color="primary">Click me</ion-button>',
      filename: 'test.html',
    },
  ],
  invalid: [
    {
      code: '<ion-item button="true"></ion-item>',
      filename: 'test.html',
      errors: [
        {
          messageId: 'no-string-boolean-ionic-attr',
          data: {
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
      errors: [
        {
          messageId: 'no-string-boolean-ionic-attr',
          data: {
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
      errors: [
        {
          messageId: 'no-string-boolean-ionic-attr',
          data: {
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
      errors: [
        {
          messageId: 'no-string-boolean-ionic-attr',
          data: {
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
      errors: [
        {
          messageId: 'no-string-boolean-ionic-attr',
          data: {
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
      errors: [
        {
          messageId: 'no-string-boolean-ionic-attr',
          data: {
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
      errors: [
        {
          messageId: 'no-string-boolean-ionic-attr',
          data: {
            attributeName: 'button',
            value: 'true',
            correctValue: 'true',
          },
        },
      ],
    },
  ],
});
