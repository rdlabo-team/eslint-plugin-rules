import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal-template';

new RuleTester().run('signal-use-as-signal-template', rule, {
  valid: [],
  invalid: [
    {
      code: `
        @Component({
          template: \`<div>
          @if (!this.count) {
              <p>Count is 1</p>
          }
          </div>\`
        })
        export class TestComponent {
          count = model(0);
        }
      `,
      errors: [
        {
          line: 4,
          messageId: 'signalUseAsSignalTemplate',
        },
      ],
    },
  ],
});
