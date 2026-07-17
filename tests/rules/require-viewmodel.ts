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

        class ViewModel extends ViewModelStore<ExamplePage> {
          readonly label = signal('hello');
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly #vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage, 'inventoryModel'> {}
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage, 'form' | 'model'> {}
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage> {
          protected override onMount(): void {
            registerAfterMount();
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

        class ViewModel extends ViewModelStore<ExamplePage> {
          constructor(host: ExamplePage) {
            super(host);
            registerCleanup();
          }
        }
      `,
    },
    {
      code: `
        class NotAComponent {}
        class ViewModel extends ViewModelStore<NotAComponent> {}
      `,
    },
    {
      code: `
        class ViewModel extends ViewModelStore<ExamplePage> {}

        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class FoodsPage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends MainViewModel<FoodsPage> {}
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class WineListPage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ListViewModel<WineListPage> {}
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class SearchPage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ModelSearch<SearchPage, SearchCondition, SearchResult> {}
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class MainPage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel<THost = MainPage> extends ViewModelStore<THost> {}
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly state = new PageState(this);
        }

        class PageState extends HostedStore<ExamplePage> {}
      `,
      options: [{ viewModelClassName: 'PageState', viewModelStoreClassName: 'HostedStore' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage> {
          readonly label = computed(() => 'x');
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
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel();
        }

        class ViewModel extends ViewModelStore<ExamplePage> {}
      `,
      errors: [{ messageId: 'viewModelMissingThis' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(other);
        }

        class ViewModel extends ViewModelStore<ExamplePage> {}
      `,
      errors: [{ messageId: 'viewModelMissingThis' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StoreModel {}
      `,
      errors: [{ messageId: 'viewModelMissingStore' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore {}
      `,
      errors: [{ messageId: 'viewModelInvalidStoreTypeArguments' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<OtherPage> {}
      `,
      errors: [{ messageId: 'viewModelHostTypeMismatch', data: { expectedHostType: 'ExamplePage' } }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends MainViewModel<OtherPage> {}
      `,
      errors: [{ messageId: 'viewModelHostTypeMismatch', data: { expectedHostType: 'ExamplePage' } }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends StateStore<ExamplePage> {}
      `,
      errors: [{ messageId: 'viewModelMissingStore' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage, 'model', 'extra'> {}
      `,
      errors: [{ messageId: 'viewModelInvalidStoreTypeArguments' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage> {
          readonly host: ReactiveHost<ExamplePage>;
        }
      `,
      errors: [{ messageId: 'viewModelOwnHost' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage> {
          constructor(host: ExamplePage) {
            super();
          }
        }
      `,
      errors: [{ messageId: 'viewModelInvalidConstructor' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage> {
          constructor(host: OtherPage) {
            super(host);
          }
        }
      `,
      errors: [{ messageId: 'viewModelInvalidConstructor' }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }

        class ViewModel extends ViewModelStore<ExamplePage> {
          readonly el = viewChild('host');
          readonly kids = viewChildren('item');
          readonly child = contentChild('x');
          readonly children = contentChildren('y');
          readonly label = computed(() => 'x');
          readonly nested = viewChild.required('nested');
          readonly run = () => effect(() => {});
          readonly after = afterNextRender(() => {});
          readonly every = afterEveryRender(() => {});
          readonly renderEffect = afterRenderEffect(() => {});
        }
      `,
      errors: [
        { messageId: 'bannedApiInViewModel', data: { api: 'viewChild' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'viewChildren' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'contentChild' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'contentChildren' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'computed' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'viewChild' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'effect' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'afterNextRender' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'afterEveryRender' } },
        { messageId: 'bannedApiInViewModel', data: { api: 'afterRenderEffect' } },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly title = 'x';
        }

        class ViewModel extends ViewModelStore<ExamplePage> {}
      `,
      errors: [{ messageId: 'missingViewModel' }],
    },
  ],
});
