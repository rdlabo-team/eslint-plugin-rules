import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/no-component-method-except-lifecycle';

new RuleTester().run('no-component-method-except-lifecycle', rule, {
  valid: [
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements ViewWillEnter, ViewWillLeave, OnDestroy {
          readonly vm = new ViewModel(this);
          readonly open = () => launchOtherPage(this.helper, {});
          readonly #reload = () => this.vm.reload$.next();

          constructor() {}

          ionViewWillEnter() {
            this.vm.reload$.next();
          }

          ionViewWillLeave() {}

          ngOnDestroy() {}
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements OnInit, AfterViewInit, ViewDidEnter {
          ngOnInit() {}
          ngAfterViewInit() {}
          ionViewDidEnter() {}
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          get label() {
            return this.vm.label();
          }

          set label(value: string) {
            this.vm.label.set(value);
          }
        }
      `,
    },
    {
      code: `
        class NotAComponent {
          open() {}
          ionViewWillEnter() {}
        }
      `,
    },
    {
      code: `
        @Directive({ selector: '[appExample]' })
        export class ExampleDirective {
          open() {}
        }
      `,
    },
    {
      code: `
        @Injectable()
        export class ExampleService {
          open() {}
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements ViewWillEnter {
          ionViewWillEnter() {}

          trackById(_index: number, item: { id: number }) {
            return item.id;
          }

          customHook() {}
        }
      `,
      options: [{ additionalAllowedMethods: ['trackById', 'customHook'] }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          readonly vm = new ViewModel(this);
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements IonicLifecycle.ViewWillEnter {
          ionViewWillEnter() {}
        }
      `,
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements OnInit {
          ['ngOnInit']() {}
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          open() {
            launchOtherPage(this.helper, {});
          }

          reload() {
            this.vm.reload$.next();
          }
        }
      `,
      errors: [
        { messageId: 'noComponentMethodExceptLifecycle', data: { method: 'open' } },
        { messageId: 'noComponentMethodExceptLifecycle', data: { method: 'reload' } },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          ionViewWillEnter() {}
          ngOnDestroy() {}
        }
      `,
      errors: [
        {
          messageId: 'lifecycleMethodRequiresImplements',
          data: { method: 'ionViewWillEnter', interface: 'ViewWillEnter' },
        },
        {
          messageId: 'lifecycleMethodRequiresImplements',
          data: { method: 'ngOnDestroy', interface: 'OnDestroy' },
        },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements ViewWillEnter {
          ionViewWillEnter() {}
          ionViewWillLeave() {}
        }
      `,
      errors: [
        {
          messageId: 'lifecycleMethodRequiresImplements',
          data: { method: 'ionViewWillLeave', interface: 'ViewWillLeave' },
        },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements OnDestroy {
          ngOnDestroy() {}
          ngOnInit() {}
        }
      `,
      errors: [
        {
          messageId: 'lifecycleMethodRequiresImplements',
          data: { method: 'ngOnInit', interface: 'OnInit' },
        },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          #open() {
            return true;
          }
        }
      `,
      errors: [{ messageId: 'noComponentMethodExceptLifecycle', data: { method: 'open' } }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements ViewWillEnter {
          ionViewWillEnter() {}

          private open() {
            return true;
          }

          protected reload() {
            return true;
          }

          public save() {
            return true;
          }
        }
      `,
      errors: [
        { messageId: 'noComponentMethodExceptLifecycle', data: { method: 'open' } },
        { messageId: 'noComponentMethodExceptLifecycle', data: { method: 'reload' } },
        { messageId: 'noComponentMethodExceptLifecycle', data: { method: 'save' } },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          async open() {
            await launchOtherPage(this.helper, {});
          }

          static create() {
            return new ExamplePage();
          }
        }
      `,
      errors: [
        { messageId: 'noComponentMethodExceptLifecycle', data: { method: 'open' } },
        { messageId: 'noComponentMethodExceptLifecycle', data: { method: 'create' } },
      ],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage implements ViewWillEnter {
          ionViewWillEnter() {}
          onSubmit() {}
        }
      `,
      errors: [{ messageId: 'noComponentMethodExceptLifecycle', data: { method: 'onSubmit' } }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          trackById(_index: number, item: { id: number }) {
            return item.id;
          }
        }
      `,
      errors: [{ messageId: 'noComponentMethodExceptLifecycle', data: { method: 'trackById' } }],
    },
    {
      code: `
        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          ['save']() {}
        }
      `,
      errors: [{ messageId: 'noComponentMethodExceptLifecycle', data: { method: 'save' } }],
    },
    {
      code: `
        const methodName = 'save';

        @Component({ selector: 'app-example', template: '' })
        export class ExamplePage {
          [methodName]() {}
        }
      `,
      errors: [{ messageId: 'noComponentMethodExceptLifecycle', data: { method: 'methodName' } }],
    },
  ],
});
