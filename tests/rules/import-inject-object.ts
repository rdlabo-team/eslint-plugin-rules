import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/import-inject-object';

new TSESLint.RuleTester().run('import-inject-object', rule, {
  valid: [
    {
      code: `
        import { Component } from '@angular/core'; 
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: `
        import { inject } from '@angular/core'; 
        export class SigninPage {
          private navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
    {
      code: `
        export class SigninPage {}
      `,
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
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
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'importInjectObject' }],
    },
  ],
});
