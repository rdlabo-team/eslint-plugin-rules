import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal';

new RuleTester().run('signal-use-as-signal', rule, {
  valid: [
    // linkedSignalのテスト
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #source = signal<number>(0);
          readonly #linked = linkedSignal({
            source: this.#source,
            computation: (): string | null => null,
          });

          updateSource() {
            this.#source.set(10);
            const value = this.#linked();
          }
        }
      `,
    },
    // inputのテスト
    {
      code: `
        @Component()
        export class SigninPage {
          readonly name = input<string>('John');

          useInput() {
            const value = this.name();
          }
        }
      `,
    },
  ],
  invalid: [
    // linkedSignalの不正な使い方
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #source = signal<number>(0);
          readonly #linked = linkedSignal({
            source: this.#source,
            computation: (): string | null => null,
          });

          updateLinked() {
            this.#linked() = 100;
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 11 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #source = signal<number>(0);
          readonly #linked = linkedSignal({
            source: this.#source,
            computation: (): string | null => null,
          });

          updateLinked() {
            this.#linked.set(100);
          }
        }
      `,
    },
    // inputの不正な使い方
    {
      code: `
        @Component()
        export class SigninPage {
          readonly name = input<string>('John');

          updateInput() {
            this.name() = 'Mike';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly name = input<string>('John');

          updateInput() {
            this.name.set('Mike');
          }
        }
      `,
    },
  ],
});
