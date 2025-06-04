import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal-template';

new RuleTester().run('signal-use-as-signal-template', rule, {
  valid: [
    {
      code: `
        @Component({
          template: '<div>{{ count() | async }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
    {
      code: `
        @Component({
          template: '<div>{{ count()?.signal }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component({
          template: '<div>{{ count | async }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
    {
      code: `
        @Component({
          template: '<div>{{ count?.signal }}</div>'
        })
        export class TestComponent {
          count = signal(0);
        }
      `,
      errors: [{ messageId: 'signalUseAsSignalTemplate', line: 3 }],
    },
  ],
});
