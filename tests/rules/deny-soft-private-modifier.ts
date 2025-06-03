import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/deny-soft-private-modifier';

new RuleTester().run('deny-soft-private-modifier', rule, {
  valid: [
    {
      code: `
        @Component()
        export class SigninPage {
          #authSubscription$: Subscription;
          public platform = inject(Platform);
          #auth = inject(AuthService);
          #navCtrl = inject(NavController);
          public helper = inject(HelperService);
        }
      `,
    },
    {
      code: `
        class Outer {
          #outerField = 1;
          #outerMethod() {}
        }
        class Inner {
          #innerField = 2;
          #innerMethod() {}
        }
      `,
    },
    {
      code: `
        class StaticExample {
          static #staticField = 1;
          static #staticMethod() {}
        }
      `,
    },
    {
      code: `
        class GetterSetter {
          #_value = 0;
          get #value() { return this.#_value; }
          set #value(v) { this.#_value = v; }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component()
        export class SigninPage {
          private authSubscription$: Subscription;
          public platform = inject(Platform);
          private auth = inject(AuthService);
          private readonly navCtrl = inject(NavController);
          public helper = inject(HelperService);
          private readonly = false;
          
          private constructor() {}
          
          useMethod() {
            this.authSubscription$.unsubscribe();
            this.useMethod2();
          }
          
          private async useMethod2() {
          }
        }
      `,
      output: `
        @Component()
        export class SigninPage {
          #authSubscription$: Subscription;
          public platform = inject(Platform);
          #auth = inject(AuthService);
          readonly #navCtrl = inject(NavController);
          public helper = inject(HelperService);
          #readonly = false;
          
          private constructor() {}
          
          useMethod() {
            this.#authSubscription$.unsubscribe();
            this.#useMethod2();
          }
          
          async #useMethod2() {
          }
        }
      `,
      errors: [
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
      ],
    },
    {
      code: `
        class Outer {
          private outerField = 1;
          private outerMethod() {
            this.outerField;
          }
        }
        class Inner {
          private innerField = 2;
          private innerMethod() {
            this.innerField;
          }
        }
      `,
      output: `
        class Outer {
          #outerField = 1;
          #outerMethod() {
            this.#outerField;
          }
        }
        class Inner {
          #innerField = 2;
          #innerMethod() {
            this.#innerField;
          }
        }
      `,
      errors: [
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
      ],
    },
    {
      code: `
        class StaticExample {
          private static staticField = 1;
          private static staticMethod() {
            this.staticField;
          }
        }
      `,
      output: `
        class StaticExample {
          static #staticField = 1;
          static #staticMethod() {
            this.#staticField;
          }
        }
      `,
      errors: [
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
      ],
    },
    {
      code: `
        class GetterSetter {
          private _value = 0;
          private get value() { return this._value; }
          private set value(v) { this._value = v; }
        }
      `,
      output: `
        class GetterSetter {
          #_value = 0;
          get #value() { return this.#_value; }
          set #value(v) { this.#_value = v; }
        }
      `,
      errors: [
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
      ],
    },
    {
      code: `
        @Component()
        class DecoratedClass {
          @Input() private inputField = '';
          @Output() private outputField = new EventEmitter();
          private method() {
            this.inputField;
            this.outputField;
          }
        }
      `,
      output: `
        @Component()
        class DecoratedClass {
          @Input() #inputField = '';
          @Output() #outputField = new EventEmitter();
          #method() {
            this.#inputField;
            this.#outputField;
          }
        }
      `,
      errors: [
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
        { messageId: 'denySoftPrivateModifier' },
      ],
    },
  ],
});
