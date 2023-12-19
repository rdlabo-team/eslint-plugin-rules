import { TSESLint } from '@typescript-eslint/utils';
import rule from '../../src/rules/deny-import-from-ionic-module';

new TSESLint.RuleTester().run('deny-import-from-ionic-module', rule, {
  valid: [
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone'; 
      `,
      parser: require.resolve('@typescript-eslint/parser'),
    },
  ],
  invalid: [
    {
      code: `
        import { ModalController } from '@ionic/angular'; 
      `,
      output: `
        import { ModalController } from '@ionic/angular/standalone'; 
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      errors: [{ messageId: 'denyImportFromIonicModule' }],
    },
  ],
});
