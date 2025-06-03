import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal';

new RuleTester().run('signal-use-as-signal', rule, {
  valid: [
    {
      code: `
        @Component()
        export class SigninPage {
          #user = signal<{ name: string }>({ name: 'John' });
        
          updateUser() {
            this.#user = signal<{ name: string }>({ name: 'Perry' });
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            const user = this.#user();
            user.name = 'Jane';
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #id = signal<number>(undefined);

          constructor() {
            this.#id.set(1);
          }

          useMethod() {
            if (this.#id()) {
              this.#id.set(2);
            }
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.#user.update(user => ({ ...user, name: 'Jane' }));
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #count = model<number>(0);

          increment() {
            this.#count.update(count => count + 1);
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = signal<{ name: string }>({ name: 'John' });
          readonly #readonlyUser = this.#user.asReadonly();

          useReadonly() {
            const name = this.#readonlyUser().name;
          }
        }
      `,
    },
    // public signal
    {
      code: `
        @Component()
        export class SigninPage {
          readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user.update(user => ({ ...user, name: 'Jane' }));
          }
        }
      `,
    },
    // soft private signal
    {
      code: `
        @Component()
        export class SigninPage {
          private readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user.update(user => ({ ...user, name: 'Jane' }));
          }
        }
      `,
    },
    // protected signal
    {
      code: `
        @Component()
        export class SigninPage {
          protected readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user.update(user => ({ ...user, name: 'Jane' }));
          }
        }
      `,
    },
    // static signal
    {
      code: `
        @Component()
        export class SigninPage {
          static readonly user = signal<{ name: string }>({ name: 'John' });

          static updateUser() {
            this.user.update(user => ({ ...user, name: 'Jane' }));
          }
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #id = signal<number>(undefined);
          
          constructor() {
            this.#id = 1;
          }
          
          useMethod() {
            if (this.#id) {
              this.#id().hoge = 1;
            }
          }
        }
      `,
      errors: [
        { messageId: 'signalUseAsSignal', line: 7 },
        { messageId: 'signalUseAsSignal', line: 11 },
        { messageId: 'signalUseAsSignal', line: 12 },
      ],
      output: `
        @Component()
        export class SigninPage {
          readonly #id = signal<number>(undefined);
          
          constructor() {
            this.#id.set(1);
          }
          
          useMethod() {
            if (this.#id()) {
              this.#id.update(value => ({ ...value, hoge: 1}));
            }
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.#user().name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.#user.update(value => ({ ...value, name: 'Jane'}));
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #count = model<number>(0);

          increment() {
            this.#count() = this.#count() + 1;
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #count = model<number>(0);

          increment() {
            this.#count.set(this.#count() + 1);
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = signal<{ name: string }>({ name: 'John' });
          readonly #readonlyUser = this.#user.asReadonly();

          updateReadonly() {
            this.#readonlyUser().name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 8 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #user = signal<{ name: string }>({ name: 'John' });
          readonly #readonlyUser = this.#user.asReadonly();

          updateReadonly() {
            this.#readonlyUser.update(value => ({ ...value, name: 'Jane'}));
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #numbers = signal<number[]>([1, 2, 3]);

          updateNumbers() {
            this.#numbers().push(4);
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #numbers = signal<number[]>([1, 2, 3]);

          updateNumbers() {
            this.#numbers.update(value => { value.push(4); return value; });
          }
        }
      `,
    },
    // public signalの不正な使用
    {
      code: `
        @Component()
        export class SigninPage {
          readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user().name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user.update(value => ({ ...value, name: 'Jane'}));
          }
        }
      `,
    },
    // soft private signalの不正な使用
    {
      code: `
        @Component()
        export class SigninPage {
          private readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user().name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          private readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user.update(value => ({ ...value, name: 'Jane'}));
          }
        }
      `,
    },
    // protected signalの不正な使用
    {
      code: `
        @Component()
        export class SigninPage {
          protected readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user().name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          protected readonly user = signal<{ name: string }>({ name: 'John' });

          updateUser() {
            this.user.update(value => ({ ...value, name: 'Jane'}));
          }
        }
      `,
    },
    // static signalの不正な使用
    {
      code: `
        @Component()
        export class SigninPage {
          static readonly user = signal<{ name: string }>({ name: 'John' });

          static updateUser() {
            this.user().name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          static readonly user = signal<{ name: string }>({ name: 'John' });

          static updateUser() {
            this.user.update(value => ({ ...value, name: 'Jane'}));
          }
        }
      `,
    },
  ],
});
