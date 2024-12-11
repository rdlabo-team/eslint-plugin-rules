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
      errors: [{ messageId: 'denyConstructorDI' }],
    },
  ],
});
