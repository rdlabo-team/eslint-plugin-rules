import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/deny-costructor-di';

new TSESLint.RuleTester().run('deny-custructor-di', rule, {
  valid: [
    {
      code: `
        export class SigninPage {
          private authSubscription$: Subscription;
          public platform = inject(Platform);
          private auth = inject(AuthService);
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: `
        export class SigninPage {
          constructor() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: `
        export class SigninPage {
          constructor() { super(); }
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: `
        export class SigninPage {
          constructor() {
            super();
          }
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
  ],
  invalid: [
    {
      code: `
        export class SigninPage {
          constructor(
            public platform: Platform,
            private auth: AuthService,
            private navCtrl: NavController,
            public helper: HelperService,
          ) {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'denyConstructorDI' }],
    },
    {
      code: `
        export class SigninPage {
          constructor(public platform: Platform) {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'denyConstructorDI' }],
    },
  ],
});
