import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal-template';

new RuleTester().run('signal-use-as-signal-template', rule, {
  valid: [
    {
      code: `
        @Component({
          template: '<div>{{ count().first() }}</div>'
        })
        export class TestComponent {
          count = signal({
            first: signal<number>(0),
            second: signal<number>(0)
          })
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<input [disabled]="isDisabled()" >'
        })
        export class TestComponent {
          isDisabled = signal(false)
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component({
          template: \`
            <input [disabled]="isDisabled" >
            <input inputmode="numeric" >
          \`
        })
        export class TestComponent {
          isDisabled = signal(false);
          numeric = signal(0);
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'signalUseAsSignalTemplate',
        },
      ],
    },
    // {
    //   code: `
    //     @Component({
    //       template: '<div>{{ count().first }}</div>'
    //     })
    //     export class TestComponent {
    //       count = signal({
    //         first: signal<number>(0),
    //         second: signal<number>(0)
    //       })
    //     }
    //   `,
    //   errors: [
    //     {
    //       line: 3,
    //       messageId: 'signalUseAsSignalTemplate',
    //     },
    //   ],
    // },
    // {
    //   code: `
    //     @Component({
    //       template: '<div>{{ count().first().second }}</div>'
    //     })
    //     export class TestComponent {
    //       count = signal({
    //         first: signal({
    //           second: signal<number>(0)
    //         })
    //       })
    //     }
    //   `,
    //   errors: [
    //     {
    //       line: 3,
    //       messageId: 'signalUseAsSignalTemplate',
    //     },
    //   ],
    // },
  ],
});
