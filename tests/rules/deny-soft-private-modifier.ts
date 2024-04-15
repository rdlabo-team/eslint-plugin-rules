import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/deny-soft-private-modifier';

new TSESLint.RuleTester().run('deny-soft-private-modifier', rule, {
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
      parser: require.resolve('@typescript-eslint/parser'),
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
          }
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'denySoftPrivateModifier' }],
    },
  ],
});
