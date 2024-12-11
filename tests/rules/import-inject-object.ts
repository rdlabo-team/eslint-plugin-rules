import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/import-inject-object';

new RuleTester().run('import-inject-object', rule, {
  valid: [
    {
      code: `
        import { Component } from '@angular/core'; 
      `,
    },
    {
      code: `
        import { inject } from '@angular/core'; 
        export class SigninPage {
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
    },
    {
      code: `
        export class SigninPage {}
      `,
    },
    {
      code: `
        describe('AuthService', () => {
          let service: AuthService;
          beforeEach(() => {
            TestBed.configureTestingModule({
              imports: [AuthPageModule, TestModule],
            });
            service = TestBed.inject(AuthService);
          });
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        export class SigninPage {
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
      output: `
        import { inject } from '@angular/core';
        export class SigninPage {
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
      errors: [{ messageId: 'importInjectObject' }],
    },
    {
      code: `
        import { Component } from '@angular/core';
        export class SigninPage {
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
      output: `
        import { Component, inject } from '@angular/core';
        export class SigninPage {
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
      errors: [{ messageId: 'importInjectObject' }],
    },
  ],
});
