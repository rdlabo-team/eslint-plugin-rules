import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../../src/rules/deny-soft-private-modifier';

new RuleTester().run('deny-soft-private-modifier', rule, {
  valid: [
    {
      code: `
        @Component()
        export class SigninPage {
          #authSubscription$: Subscription;
          public platform = inject(Platform);
          #auth = inject(AuthService);
          #navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component()
        export class SigninPage {
          private authSubscription$: Subscription;
          public platform = inject(Platform);
          private auth = inject(AuthService);
          private readonly navCtrl = inject(NavController);
          public helper = inject(HelperService);
          private readonly = false;
          
          private constructor() {}
          
          useMethod() {
            this.authSubscription$.unsubscribe();
            this.useMethod2();
          }
          
          private async useMethod2() {
          }
        }
      `,
      output: `
        @Component()
        export class SigninPage {
           #authSubscription$: Subscription;
          public platform = inject(Platform);
           #auth = inject(AuthService);
           readonly #navCtrl = inject(NavController);
          public helper = inject(HelperService);
           #readonly = false;
          
          private constructor() {}
          
          useMethod() {
            this.#authSubscription$.unsubscribe();
            this.#useMethod2();
          }
          
           async #useMethod2() {
          }
        }
      `,
      errors: [{ messageId: 'denySoftPrivateModifier' }],
    },
  ],
});
