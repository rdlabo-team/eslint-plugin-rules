import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/deny-constructor-di';

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
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-signin',
          templateUrl: './confirm.page.html',
          styleUrls: ['./confirm.page.scss'],
        })
        export class SigninPage {
          constructor(
            public platform: Platform,
            private store: Store<IApp>,
            private readonly navCtrl: NavController,
            public readonly helper: HelperService,
          ) {}
        }
      `,
      output: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-signin',
          templateUrl: './confirm.page.html',
          styleUrls: ['./confirm.page.scss'],
        })
        export class SigninPage {
          public platform = inject(Platform);
          private store = inject(Store);
          private readonly navCtrl = inject(NavController);
          public readonly helper = inject(HelperService);
          
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
          public platform = inject(Platform);
          
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
          constructor(private platform: Platform) {}
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
          private platform = inject(Platform);
          
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
        export class ConfirmPage {
          constructor(public readonly platform: Platform) {}
        }
      `,
      output: `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-confirm',
          templateUrl: './confirm.page.html',
          styleUrls: ['./confirm.page.scss'],
        })
        export class ConfirmPage {
          public readonly platform = inject(Platform);
          
          constructor() {}
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'denyConstructorDI' }],
    },
  ],
});
