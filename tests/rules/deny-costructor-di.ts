import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/deny-constructor-di';

new RuleTester().run('deny-custructor-di', rule, {
  valid: [
    {
      code: `
        @Component()
        export class SigninPage {
          private authSubscription$: Subscription;
          public platform = inject(Platform);
          private auth = inject(AuthService);
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
    },
    {
      code: `
        export class LogManager {
          constructor(logDomain: string) {
            this.logDomain = logDomain;
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          constructor() {}
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          constructor() { super(); }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          constructor() {
            super();
          }
        }
      `,
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
      errors: [
        { messageId: 'denyConstructorDI', line: 11 },
        { messageId: 'denyConstructorDI', line: 12 },
        { messageId: 'denyConstructorDI', line: 13 },
        { messageId: 'denyConstructorDI', line: 14 },
      ],
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
      errors: [{ messageId: 'denyConstructorDI', line: 10 }],
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
      errors: [{ messageId: 'denyConstructorDI', line: 10 }],
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
      errors: [{ messageId: 'denyConstructorDI', line: 10 }],
    },
  ],
});
