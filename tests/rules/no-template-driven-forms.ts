import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/no-template-driven-forms';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('no-template-driven-forms', rule, {
  valid: [
    { code: '<input [formField]="userForm.name" />', filename: 'template.html' },
    {
      code: '<ion-searchbar [(ngModel)]="query"></ion-searchbar>',
      filename: 'template.html',
      options: [{ allowedElements: ['ion-searchbar'] }],
    },
    {
      code: '<ion-checkbox [ngModel]="checked" (ngModelChange)="checked = $event"></ion-checkbox>',
      filename: 'template.html',
      options: [{ allowedElements: ['ion-checkbox'] }],
    },
  ],
  invalid: [
    {
      code: '<input [(ngModel)]="name" />',
      filename: 'template.html',
      errors: [{ messageId: 'templateDrivenForms', data: { element: 'input' } }],
    },
    {
      code: '<ion-input [(ngModel)]="name"></ion-input>',
      filename: 'template.html',
      options: [{ allowedElements: ['ion-searchbar'] }],
      errors: [{ messageId: 'templateDrivenForms', data: { element: 'ion-input' } }],
    },
    {
      code: '@if (show) { <ion-textarea ngModel></ion-textarea> }',
      filename: 'template.html',
      errors: [{ messageId: 'templateDrivenForms', data: { element: 'ion-textarea' } }],
    },
    {
      code: '<form #form="ngForm"></form>',
      filename: 'template.html',
      errors: [{ messageId: 'templateDrivenFormsDirective', data: { directive: 'ngForm' } }],
    },
    {
      code: '<div ngModelGroup="address"></div>',
      filename: 'template.html',
      errors: [{ messageId: 'templateDrivenFormsDirective', data: { directive: 'ngModelGroup' } }],
    },
    {
      code: '<ion-searchbar ngModelGroup="search" [(ngModel)]="query"></ion-searchbar>',
      filename: 'template.html',
      options: [{ allowedElements: ['ion-searchbar'] }],
      errors: [{ messageId: 'templateDrivenFormsDirective', data: { directive: 'ngModelGroup' } }],
    },
  ],
});
