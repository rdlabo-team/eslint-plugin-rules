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
      errors: [
        {
          messageId: 'requireIonItemGroup',
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: '<ion-list><ion-item-group><ion-item></ion-item></ion-item-group></ion-list>',
            },
          ],
        },
      ],
    },
    {
      code: '<ion-list><div><ion-item></ion-item></div></ion-list>',
      filename: 'template.html',
      output: null,
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
      output: null,
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
      errors: [
        {
          messageId: 'requireIonItemGroup',
          line: 4,
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: `
        <ion-list><ion-item-group>
          @for (item of items; track item.id) {
            <ion-item>{{ item.name }}</ion-item>
          }
        </ion-item-group></ion-list>
      `,
            },
          ],
        },
      ],
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
        {
          messageId: 'requireIonItemGroup',
          line: 4,
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: `
        <ion-list><ion-item-group>
          @if (visible) {
            <ion-item>First</ion-item>
          } @else {
            <ion-item>Second</ion-item>
          }
        </ion-item-group></ion-list>
      `,
            },
          ],
        },
        { messageId: 'requireIonItemGroup', line: 6, suggestions: null },
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
      errors: [{ messageId: 'requireIonItemGroup', line: 6, suggestions: null }],
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
        { messageId: 'requireIonItemGroup', line: 6, suggestions: null },
        { messageId: 'requireIonItemGroup', line: 8, suggestions: null },
        { messageId: 'requireIonItemGroup', line: 10, suggestions: null },
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
        {
          messageId: 'requireIonItemGroup',
          line: 4,
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: `
        <ion-list><ion-item-group>
          @switch (selected) {
            @case ('first') { <ion-item>First</ion-item> }
            @default { <ion-item>Default</ion-item> }
          }
        </ion-item-group></ion-list>
      `,
            },
          ],
        },
        { messageId: 'requireIonItemGroup', line: 5, suggestions: null },
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
        { messageId: 'requireIonItemGroup', line: 3, suggestions: null },
        {
          messageId: 'requireIonItemGroup',
          line: 5,
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: `
        <ion-list>
          <ion-item>Outer</ion-item>
          <ion-list><ion-item-group>
            <ion-item>Inner</ion-item>
          </ion-item-group></ion-list>
        </ion-list>
      `,
            },
          ],
        },
      ],
    },
    {
      code: '<ion-list><ion-item>First</ion-item><!-- separator --><ion-item>Second</ion-item></ion-list>',
      filename: 'template.html',
      errors: [
        {
          messageId: 'requireIonItemGroup',
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: '<ion-list><ion-item-group><ion-item>First</ion-item><!-- separator --><ion-item>Second</ion-item></ion-item-group></ion-list>',
            },
          ],
        },
        { messageId: 'requireIonItemGroup', suggestions: null },
      ],
    },
    {
      code: '<ion-list><ng-container><ion-item button>😀</ion-item></ng-container></ion-list>',
      filename: 'template.html',
      errors: [
        {
          messageId: 'requireIonItemGroup',
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: '<ion-list><ion-item-group><ng-container><ion-item button>😀</ion-item></ng-container></ion-item-group></ion-list>',
            },
          ],
        },
      ],
    },
    {
      code: '<ion-list><ion-item /></ion-list>',
      filename: 'template.html',
      errors: [
        {
          messageId: 'requireIonItemGroup',
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: '<ion-list><ion-item-group><ion-item /></ion-item-group></ion-list>',
            },
          ],
        },
      ],
    },
    {
      code: '<ion-list><ion-item-group><ion-item>Grouped</ion-item></ion-item-group><ion-item>Bare</ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [{ messageId: 'requireIonItemGroup', suggestions: null }],
    },
    {
      code: '<ion-list><ion-item>Outer<ion-list><ion-item>Inner</ion-item></ion-list></ion-item></ion-list>',
      filename: 'template.html',
      errors: [
        { messageId: 'requireIonItemGroup', suggestions: null },
        {
          messageId: 'requireIonItemGroup',
          suggestions: [
            {
              messageId: 'wrapIonItemGroup',
              output: '<ion-list><ion-item>Outer<ion-list><ion-item-group><ion-item>Inner</ion-item></ion-item-group></ion-list></ion-item></ion-list>',
            },
          ],
        },
      ],
    },
    {
      code: '<ion-item-group></ion-item-group><ion-list><ion-item>A</ion-item><ion-item>B</ion-item></ion-list>',
      filename: 'template.html',
      output: '<ion-item-group></ion-item-group><ion-list><ion-item-group><ion-item>A</ion-item><ion-item>B</ion-item></ion-item-group></ion-list>',
      errors: [{ messageId: 'requireIonItemGroup' }, { messageId: 'requireIonItemGroup' }],
    },
    {
      code: `
        <ion-item-group></ion-item-group>
        <ion-list>
          @for (item of items; track item.id) {
            <ion-item>{{ item.name }}</ion-item>
          }
        </ion-list>
      `,
      filename: 'template.html',
      output: `
        <ion-item-group></ion-item-group>
        <ion-list><ion-item-group>
          @for (item of items; track item.id) {
            <ion-item>{{ item.name }}</ion-item>
          }
        </ion-item-group></ion-list>
      `,
      errors: [{ messageId: 'requireIonItemGroup' }],
    },
    {
      code: '<ion-list>Heading<ion-item>Item</ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [{ messageId: 'requireIonItemGroup', suggestions: null }],
    },
    {
      code: '<ion-list>{{ heading }}<ion-item>Item</ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [{ messageId: 'requireIonItemGroup', suggestions: null }],
    },
    {
      code: '<ion-item-group></ion-item-group><ion-list><ng-content></ng-content><ion-item>Item</ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [{ messageId: 'requireIonItemGroup', suggestions: null }],
    },
    {
      code: '<ion-item-group></ion-item-group><ion-list>{count, plural, =0 {none} other {{{count}} items}}<ion-item>Item</ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [{ messageId: 'requireIonItemGroup', suggestions: null }],
    },
    {
      code: '<ion-item-group></ion-item-group><ion-list><ng-container *ngTemplateOutlet="template"></ng-container><ion-item>Item</ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [{ messageId: 'requireIonItemGroup', suggestions: null }],
    },
    {
      code: '<ion-item-group></ion-item-group><ion-list><ng-container *ngComponentOutlet="component"></ng-container><ion-item>Item</ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [{ messageId: 'requireIonItemGroup', suggestions: null }],
    },
    {
      code: '<ion-item-group></ion-item-group><ion-list><ion-item>Outer<ion-item>Inner</ion-item></ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [
        { messageId: 'requireIonItemGroup', suggestions: null },
        { messageId: 'requireIonItemGroup', suggestions: null },
      ],
    },
    {
      code: '<ion-item-group></ion-item-group><ion-list><ion-item>Outer<div><ion-item>Inner</ion-item></div></ion-item></ion-list>',
      filename: 'template.html',
      output: null,
      errors: [
        { messageId: 'requireIonItemGroup', suggestions: null },
        { messageId: 'requireIonItemGroup', suggestions: null },
      ],
    },
  ],
});
