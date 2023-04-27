import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/import-inject-object';

new TSESLint.RuleTester().run('import-inject-object', rule, {
  valid: [
    {
      code: `
        import { Inject } from '@angular/core'; 
        export class SigninPage {
          private navCtrl = Inject(NavController);
          public helper = Inject(HelperService);
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
  ],
  invalid: [
    {
      code: `
        export class SigninPage {
          private navCtrl = Inject(NavController);
          public helper = Inject(HelperService);
        }
      `,
      output: `
        import { Inject } from '@angular/core';
        export class SigninPage {
          private navCtrl = Inject(NavController);
          public helper = Inject(HelperService);
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'importInjectObject' }],
    },
    {
      code: `
        import { Component } from '@angular/core';
        export class SigninPage {
          private navCtrl = Inject(NavController);
          public helper = Inject(HelperService);
        }
      `,
      output: `
        import { Component, Inject } from '@angular/core';
        export class SigninPage {
          private navCtrl = Inject(NavController);
          public helper = Inject(HelperService);
        }
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'importInjectObject' }],
    },
  ],
});
