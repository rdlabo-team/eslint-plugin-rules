import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/signal-use-as-signal';

new TSESLint.RuleTester().run('signal-use-as-signal', rule, {
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
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [
        { messageId: 'signalUseAsSignal' },
        { messageId: 'signalUseAsSignal' },
      ],
    },
  ],
});
