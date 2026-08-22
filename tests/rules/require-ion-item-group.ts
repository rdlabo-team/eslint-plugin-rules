import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/require-ion-item-group';

const ruleTester = new RuleTester({
  languageOptions: {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    parser: require('@angular-eslint/template-parser'),
  },
});

ruleTester.run('require-ion-item-group', rule, {
  valid: [
    { code: '<ion-item></ion-item>', filename: 'template.html' },
    { code: '<ion-list></ion-list>', filename: 'template.html' },
    {
      code: '<ion-list><ion-item-group><ion-item></ion-item></ion-item-group></ion-list>',
      filename: 'template.html',
    },
    {
      code: '<ion-list><ion-reorder-group><ion-item></ion-item></ion-reorder-group></ion-list>',
      filename: 'template.html',
    },
    {
      code: '<ion-list><ion-accordion-group><ion-accordion><ion-item slot="header"></ion-item></ion-accordion></ion-accordion-group></ion-list>',
      filename: 'template.html',
    },
    {
      code: '<ion-list><ion-radio-group><ion-item></ion-item></ion-radio-group></ion-list>',
      filename: 'template.html',
    },
    {
      code: `
        <ion-list>
          <ion-item-group>
            @for (item of items; track item.id) {
              <ion-item>{{ item.name }}</ion-item>
            }
          </ion-item-group>
        </ion-list>
      `,
      filename: 'template.html',
    },
    {
      code: `
        <ion-list>
          <ion-accordion-group>
            @switch (selected) {
              @case ('first') {
                <ion-accordion><ion-item slot="header">First</ion-item></ion-accordion>
              }
              @default {
                <ion-accordion><ion-item slot="header">Default</ion-item></ion-accordion>
              }
            }
          </ion-accordion-group>
        </ion-list>
      `,
      filename: 'template.html',
    },
    {
      code: `
        <ion-list>
          @if (grouped) {
            <ion-radio-group>
              @if (visible) {
                <ion-item>Choice</ion-item>
              }
            </ion-radio-group>
          }
        </ion-list>
      `,
      filename: 'template.html',
    },
    {
      code: '<ion-list><ion-item></ion-item></ion-list>',
      filename: 'template.spec.html',
    },
    {
      code: '<ion-list><ng-container><ion-item-group><ion-item></ion-item></ion-item-group></ng-container></ion-list>',
      filename: 'template.html',
    },
    {
      code: '<ion-list><ng-template><ion-item-group><ion-item></ion-item></ion-item-group></ng-template></ion-list>',
      filename: 'template.html',
    },
  ],
  invalid: [
    {
      code: '<ion-list><ion-item></ion-item></ion-list>',
      filename: 'template.html',
      errors: [{ messageId: 'requireIonItemGroup' }],
    },
    {
      code: '<ion-list><div><ion-item></ion-item></div></ion-list>',
      filename: 'template.html',
      errors: [{ messageId: 'requireIonItemGroup' }],
    },
    {
      code: '<ion-list><ion-item-group><div><ion-item></ion-item></div></ion-item-group></ion-list>',
      filename: 'template.html',
      errors: [{ messageId: 'requireIonItemGroup' }],
    },
    {
      code: '<ion-list><app-item-group><ion-item></ion-item></app-item-group></ion-list>',
      filename: 'template.html',
      errors: [{ messageId: 'requireIonItemGroup' }],
    },
    {
      code: '<ion-list><ion-accordion-group><ion-item></ion-item></ion-accordion-group></ion-list>',
      filename: 'template.html',
      errors: [{ messageId: 'requireIonItemGroup' }],
    },
    {
      code: `
        <ion-list>
          @for (item of items; track item.id) {
            <ion-item>{{ item.name }}</ion-item>
          }
        </ion-list>
      `,
      filename: 'template.html',
      errors: [{ messageId: 'requireIonItemGroup', line: 4 }],
    },
    {
      code: `
        <ion-list>
          @if (visible) {
            <ion-item>First</ion-item>
          } @else {
            <ion-item>Second</ion-item>
          }
        </ion-list>
      `,
      filename: 'template.html',
      errors: [
        { messageId: 'requireIonItemGroup', line: 4 },
        { messageId: 'requireIonItemGroup', line: 6 },
      ],
    },
    {
      code: `
        <ion-list>
          @for (item of items; track item.id) {
            <ion-item-group><ion-item>{{ item.name }}</ion-item></ion-item-group>
          } @empty {
            <ion-item>Empty</ion-item>
          }
        </ion-list>
      `,
      filename: 'template.html',
      errors: [{ messageId: 'requireIonItemGroup', line: 6 }],
    },
    {
      code: `
        <ion-list>
          @defer (when ready) {
            <ion-item-group><ion-item>Ready</ion-item></ion-item-group>
          } @placeholder {
            <ion-item>Placeholder</ion-item>
          } @loading {
            <ion-item>Loading</ion-item>
          } @error {
            <ion-item>Error</ion-item>
          }
        </ion-list>
      `,
      filename: 'template.html',
      errors: [
        { messageId: 'requireIonItemGroup', line: 6 },
        { messageId: 'requireIonItemGroup', line: 8 },
        { messageId: 'requireIonItemGroup', line: 10 },
      ],
    },
    {
      code: `
        <ion-list>
          @switch (selected) {
            @case ('first') { <ion-item>First</ion-item> }
            @default { <ion-item>Default</ion-item> }
          }
        </ion-list>
      `,
      filename: 'template.html',
      errors: [
        { messageId: 'requireIonItemGroup', line: 4 },
        { messageId: 'requireIonItemGroup', line: 5 },
      ],
    },
    {
      code: `
        <ion-list>
          <ion-item>Outer</ion-item>
          <ion-list>
            <ion-item>Inner</ion-item>
          </ion-list>
        </ion-list>
      `,
      filename: 'template.html',
      errors: [
        { messageId: 'requireIonItemGroup', line: 3 },
        { messageId: 'requireIonItemGroup', line: 5 },
      ],
    },
  ],
});
