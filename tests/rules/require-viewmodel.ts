import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/require-viewmodel';

new RuleTester().run('require-viewmodel', rule, {
  valid: [
    {
      code: `
        import { Component, computed, effect, viewChild } from '@angular/core';

        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
          readonly title = computed(() => this.vm.label());
          readonly el = viewChild('host');

          constructor() {
            effect(() => this.vm.label());
          }
        }

        class ViewModel extends StoreModel {
          constructor(readonly host: ExamplePage) {
            super();
          }
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly #vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          constructor(readonly host: ExamplePage) {
            super(host);
          }

          readonly items = signal([]);
        }
      `,
    },
    {
      code: `
        class NotAComponent {
          open() {}
        }

        class ViewModel extends StoreModel {
          constructor(readonly host: unknown) {
            super();
          }
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel {
          constructor(readonly host: ExamplePage) {}
        }
      `,
      options: [{ requireExtends: false }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly state = new PageState(this);
        }

        class PageState extends StoreModel {
          constructor(readonly host: ExamplePage) {
            super();
          }
        }
      `,
      options: [{ viewModelClassName: 'PageState' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          readonly label = computed(() => 'x');

          constructor(readonly host: ExamplePage) {
            super();
          }
        }
      `,
      options: [{ bannedApis: ['viewChild', 'effect'] }],
    },
  ],
  invalid: [
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly title = 'x';
        }
      `,
      errors: [{ messageId: 'missingViewModel' }],
    },
    {
      code: `
        @Component({ selector: 'app-a', template: '' })
        export class APage {}

        @Component({ selector: 'app-b', template: '' })
        export class BPage {
          readonly title = 'x';
        }
      `,
      errors: [{ messageId: 'missingViewModel' }, { messageId: 'missingViewModel' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel();
        }

        class ViewModel extends StoreModel {
          constructor() {
            super();
          }
        }
      `,
      errors: [{ messageId: 'viewModelMissingThis' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(other);
        }

        class ViewModel extends StoreModel {
          constructor(readonly host: unknown) {
            super();
          }
        }
      `,
      errors: [{ messageId: 'viewModelMissingThis' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          constructor(readonly host: ExamplePage) {}
        }
      `,
      errors: [{ messageId: 'viewModelMissingSuper' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          readonly host: ExamplePage;
        }
      `,
      errors: [{ messageId: 'viewModelMissingSuper' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel {
          constructor(readonly host: ExamplePage) {
            super();
          }
        }
      `,
      errors: [{ messageId: 'viewModelMissingExtends' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel {
          readonly host: ExamplePage;
        }
      `,
      errors: [{ messageId: 'viewModelMissingExtends' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          readonly el = viewChild('host');
          readonly kids = viewChildren('item');
          readonly child = contentChild('x');
          readonly children = contentChildren('y');
          readonly label = computed(() => 'x');

          constructor(readonly host: ExamplePage) {
            super();
            effect(() => {});
          }
        }
      `,
      errors: [
        { messageId: 'bannedApiInViewModel', data: { api: 'viewChild' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'viewChildren' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'contentChild' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'contentChildren' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'computed' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'effect' } },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          readonly el = viewChild.required('host');

          constructor(readonly host: ExamplePage) {
            super();
          }
        }
      `,
      errors: [{ messageId: 'bannedApiInViewModel', data: { api: 'viewChild' } }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly state = new PageState();
        }

        class PageState extends StoreModel {
          constructor() {
            super();
          }
        }
      `,
      options: [{ viewModelClassName: 'PageState' }],
      errors: [{ messageId: 'viewModelMissingThis' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly title = 'x';
        }

        class ViewModel extends StoreModel {
          constructor(readonly host: ExamplePage) {
            super();
          }
        }
      `,
      errors: [{ messageId: 'missingViewModel' }],
    },
  ],
});
