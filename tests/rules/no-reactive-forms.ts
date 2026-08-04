import { RuleTester, RuleTester as TemplateRuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/no-reactive-forms';

new RuleTester().run('no-reactive-forms (typescript)', rule, {
  valid: [`import { form, FormField, required } from '@angular/forms/signals';`, `import { FormsModule } from '@angular/forms';`],
  invalid: [
    {
      code: `import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';`,
      errors: [
        { messageId: 'reactiveFormsImport', data: { name: 'FormControl' } },
        { messageId: 'reactiveFormsImport', data: { name: 'FormGroup' } },
        { messageId: 'reactiveFormsImport', data: { name: 'ReactiveFormsModule' } },
      ],
    },
  ],
});

new TemplateRuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
}).run('no-reactive-forms (template)', rule, {
  valid: [{ code: '<input [formField]="userForm.name" />', filename: 'template.html' }],
  invalid: [
    {
      code: '<form [formGroup]="userForm"><input formControlName="name" /></form>',
      filename: 'template.html',
      errors: [
        { messageId: 'reactiveFormsBinding', data: { name: 'formGroup' } },
        { messageId: 'reactiveFormsBinding', data: { name: 'formControlName' } },
      ],
    },
  ],
});
