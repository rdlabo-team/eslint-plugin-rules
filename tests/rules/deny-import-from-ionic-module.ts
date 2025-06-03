import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/deny-import-from-ionic-module';

new RuleTester().run('deny-import-from-ionic-module', rule, {
  valid: [
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone'; 
      `,
    },
    {
      code: `
        import { AlertController, ModalController } from '@ionic/angular/standalone';
      `,
    },
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone';
        import { AlertController } from '@ionic/angular/standalone';
      `,
    },
    {
      code: `
        import { ModalController } from '@ionic/angular/standalone';
        import { Component } from '@angular/core';
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
      errors: [{ messageId: 'denyImportFromIonicModule', line: 2 }],
    },
    {
      code: `
        import { AlertController, ModalController } from '@ionic/angular';
      `,
      output: `
        import { AlertController, ModalController } from '@ionic/angular/standalone';
      `,
      errors: [{ messageId: 'denyImportFromIonicModule', line: 2 }],
    },
    {
      code: `
        import { ModalController } from '@ionic/angular';
        import { AlertController } from '@ionic/angular';
      `,
      output: `
        import { ModalController } from '@ionic/angular/standalone';
        import { AlertController } from '@ionic/angular/standalone';
      `,
      errors: [
        { messageId: 'denyImportFromIonicModule', line: 2 },
        { messageId: 'denyImportFromIonicModule', line: 3 },
      ],
    },
    {
      code: `
        import { ModalController } from '@ionic/angular';
        import { Component } from '@angular/core';
      `,
      output: `
        import { ModalController } from '@ionic/angular/standalone';
        import { Component } from '@angular/core';
      `,
      errors: [{ messageId: 'denyImportFromIonicModule', line: 2 }],
    },
  ],
});
