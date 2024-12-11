import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../../src/rules/signal-use-as-signal';

new RuleTester().run('signal-use-as-signal', rule, {
  valid: [
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #id = signal<number>(undefined);

          constructor() {
            this.#id.set(1);
          }

          useMethod() {
            if (this.#id()) {
              this.#id.set(2);
            }
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
          readonly #id = signal<number>(undefined);
          
          constructor() {
            this.#id = 1;
          }
          
          useMethod() {
            if (this.#id) {
              this.#id().hoge = 1;
            }
          }
        }
      `,
      errors: [
        { messageId: 'signalUseAsSignal' },
        { messageId: 'signalUseAsSignal' },
      ],
    },
  ],
});
