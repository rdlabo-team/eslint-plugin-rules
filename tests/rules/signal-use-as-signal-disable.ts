import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal';

new RuleTester().run('signal-use-as-signal', rule, {
  valid: [
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: signal<{ name: string }>({ name: 'John' })
          };

          updateUser() {
            this.#user.first.update(value => ({ ...value, name: 'Jane' }));
          }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: signal<{ name: string }>({ name: 'John' })
          };

          updateUser() {
            this.#user.first.name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 9 }],
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: {
              second: signal<{ name: string }>({ name: 'John' })
            }
          };

          updateUser() {
            this.#user.first.second.name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 11 }],
    },
  ],
});
