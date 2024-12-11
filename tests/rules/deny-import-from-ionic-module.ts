import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/deny-import-from-ionic-module';

new RuleTester().run('deny-import-from-ionic-module', rule, {
  valid: [
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone'; 
      `,
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
      errors: [{ messageId: 'denyImportFromIonicModule' }],
    },
  ],
});
