import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal-template';

new RuleTester().run('signal-use-as-signal-template', rule, {
  valid: [],
  invalid: [
    {
      code: `
        @Component({
          template: \`<div>
          {{ count }}
          </div>\`
        })
        export class TestComponent {
          count = model(0);
        }
      `,
      errors: [
        {
          line: 4,
          message:
            'Angular Signal count must be called count() to access its value in the template',
        },
      ],
    },
  ],
});
