import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/deny-constructor-di';

new TSESLint.RuleTester().run('deny-custructor-di', rule, {
  valid: [
    {
      code: `
        export class SigninPage {
          private authSubscription$: Subscription;
          public platform = Inject(Platform);
          private auth = Inject(AuthService);
          private navCtrl = Inject(NavController);
          public helper = Inject(HelperService);
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
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-confirm',
          templateUrl: './confirm.page.html',
          styleUrls: ['./confirm.page.scss'],
        })
        export class SigninPage {
          constructor(
            public platform: Platform,
            private store: Store<IApp>,
            private navCtrl: NavController,
            public helper: HelperService,
          ) {}
        }
      `,
      output: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-confirm',
          templateUrl: './confirm.page.html',
          styleUrls: ['./confirm.page.scss'],
        })
        export class SigninPage {
          public platform = Inject(Platform);
          private store = Inject(Store<IApp>);
          private navCtrl = Inject(NavController);
          public helper = Inject(HelperService);
          
          constructor() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'denyConstructorDI' }],
    },
    {
      code: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-confirm',
          templateUrl: './confirm.page.html',
          styleUrls: ['./confirm.page.scss'],
        })
        export class SigninPage {
          constructor(public platform: Platform) {}
        }
      `,
      output: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-confirm',
          templateUrl: './confirm.page.html',
          styleUrls: ['./confirm.page.scss'],
        })
        export class SigninPage {
          public platform = Inject(Platform);
          
          constructor() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'denyConstructorDI' }],
    },
  ],
});
