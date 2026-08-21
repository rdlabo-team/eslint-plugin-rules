import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/prefer-ionic-standalone';

new RuleTester().run('prefer-ionic-standalone', rule, {
  valid: [
    {
      code: `import { IonButton, ModalController, provideIonicAngular } from '@ionic/angular';`,
    },
    {
      code: `import { Component } from '@angular/core';`,
    },
    {
      code: `import type { IonicConfig } from '@ionic/core';`,
    },
    {
      code: `export { IonButton } from '@ionic/angular';`,
    },
    {
      code: `import * as Ionic from '@ionic/angular'; function read(Ionic: { IonicModule: unknown }) { return Ionic.IonicModule; }`,
    },
  ],
  invalid: [
    {
      code: `import { IonButton } from '@ionic/angular/standalone';`,
      output: `import { IonButton } from '@ionic/angular';`,
      errors: [{ messageId: 'preferRootEntrypoint', data: { entrypoint: '@ionic/angular/standalone' } }],
    },
    {
      code: `import { IonInput } from '@ionic/angular/lazy';`,
      output: `import { IonInput } from '@ionic/angular';`,
      errors: [{ messageId: 'preferRootEntrypoint', data: { entrypoint: '@ionic/angular/lazy' } }],
    },
    {
      code: `import { IonInput } from "@ionic/angular/lazy";`,
      output: `import { IonInput } from "@ionic/angular";`,
      errors: [{ messageId: 'preferRootEntrypoint', data: { entrypoint: '@ionic/angular/lazy' } }],
    },
    {
      code: `import '@ionic/angular/lazy';`,
      output: null,
      errors: [{ messageId: 'preferRootEntrypoint' }],
    },
    {
      code: `import * as Ionic from '@ionic/angular/lazy';`,
      output: null,
      errors: [{ messageId: 'preferRootEntrypoint' }],
    },
    {
      code: `import { IonicModule } from '@ionic/angular';`,
      errors: [{ messageId: 'noIonicModule' }],
    },
    {
      code: `import { IonicModule as LegacyIonicModule, IonApp } from '@ionic/angular';`,
      errors: [{ messageId: 'noIonicModule' }],
    },
    {
      code: `import type { IonicModule } from '@ionic/angular';`,
      errors: [{ messageId: 'noIonicModule' }],
    },
    {
      code: `export { IonButton } from '@ionic/angular/lazy';`,
      output: `export { IonButton } from '@ionic/angular';`,
      errors: [{ messageId: 'preferRootEntrypoint', data: { entrypoint: '@ionic/angular/lazy' } }],
    },
    {
      code: `export { IonicModule } from '@ionic/angular';`,
      errors: [{ messageId: 'noIonicModule' }],
    },
    {
      code: `export * from '@ionic/angular/lazy';`,
      errors: [{ messageId: 'preferRootEntrypoint' }],
    },
    {
      code: `export * from '@ionic/angular';`,
      errors: [{ messageId: 'noIonicModule' }],
    },
    {
      code: `export * as Ionic from '@ionic/angular';`,
      errors: [{ messageId: 'noIonicModule' }],
    },
    {
      code: `import * as Ionic from '@ionic/angular'; Ionic.IonicModule.forRoot();`,
      errors: [{ messageId: 'noIonicModule' }],
    },
    {
      code: `import * as Ionic from '@ionic/angular'; Ionic['IonicModule'].forRoot();`,
      errors: [{ messageId: 'noIonicModule' }],
    },
  ],
});
