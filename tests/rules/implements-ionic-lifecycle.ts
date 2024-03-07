import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/implements-ionic-lifecycle';

new TSESLint.RuleTester().run('implements-ionic-lifecycle', rule, {
  valid: [
    {
      code: `
        export class ExamplePage implements ViewWillEnter, ViewWillLeave {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: `
        export class ExamplePage implements ViewDidEnter, ViewDidLeave {
          ionViewDidEnter() {}
          ionViewDidLeave() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
  ],
  invalid: [
    {
      code: `
        export class ExamplePage {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [
        { messageId: 'implementsIonicLifecycle' },
        { messageId: 'implementsIonicLifecycle' },
      ],
    },
    {
      code: `
        export class ExamplePage implements ViewDidEnter, ViewDidLeave {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [
        { messageId: 'implementsIonicLifecycle' },
        { messageId: 'implementsIonicLifecycle' },
      ],
    },
  ],
});
