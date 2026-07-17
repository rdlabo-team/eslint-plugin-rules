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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            super(host);
            this.host = host;
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
          readonly host: ReactiveHost<NotAComponent>;

          constructor(host: NotAComponent) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            this.host = host;
          }
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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<Component>;

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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            this.host = host;
          }
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
          readonly host: ReactiveHost<Component>;
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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<Component>;
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
          readonly host: ReactiveHost<ExamplePage>;
          readonly el = viewChild('host');
          readonly kids = viewChildren('item');
          readonly child = contentChild('x');
          readonly children = contentChildren('y');
          readonly label = computed(() => 'x');

          constructor(host: ExamplePage) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<ExamplePage>;
          readonly el = viewChild.required('host');

          constructor(host: ExamplePage) {
            super();
            this.host = host;
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
          readonly host: ReactiveHost<Component>;

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
          readonly host: ReactiveHost<ExamplePage>;

          constructor(host: ExamplePage) {
            super();
            this.host = host;
          }
        }
      `,
      errors: [{ messageId: 'missingViewModel' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          constructor(readonly host: ExamplePage) {
            super();
          }
        }
      `,
      errors: [{ messageId: 'viewModelMissingReactiveHost', data: { hostType: 'ExamplePage' } }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {
          readonly host: ReactiveHost<OtherPage>;

          constructor(host: ExamplePage) {
            super();
            this.host = host;
          }
        }
      `,
      errors: [{ messageId: 'viewModelMissingReactiveHost', data: { hostType: 'ExamplePage' } }],
    },
  ],
});
