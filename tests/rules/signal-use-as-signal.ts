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
    // 配列の操作
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #items = signal<string[]>(['a', 'b', 'c']);

          updateItems() {
            this.#items.update(items => [...items, 'd']);
          }
        }
      `,
    },
    // オブジェクトのネストされた更新
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #config = signal<{ settings: { theme: string } }>({ settings: { theme: 'light' } });

          updateTheme() {
            this.#config.update(config => ({
              ...config,
              settings: { ...config.settings, theme: 'dark' }
            }));
          }
        }
      `,
    },
    // 複数のシグナルの組み合わせ
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #count = signal<number>(0);
          readonly #multiplier = signal<number>(2);

          calculate() {
            const result = this.#count() * this.#multiplier();
            return result;
          }
        }
      `,
    },
    // シグナルの初期化と更新
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #value = signal<number>(0);

          initialize() {
            this.#value.set(10);
          }

          increment() {
            this.#value.update(v => v + 1);
          }
        }
      `,
    },
    // 配列の複雑な操作
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #items = signal<{ id: number; name: string }[]>([
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ]);

          updateItems() {
            this.#items.update(items => 
              items.map(item => item.id === 1 ? { ...item, name: 'Updated Item' } : item)
            );
          }
        }
      `,
    },
    // 深くネストされたオブジェクトの更新
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #state = signal<{
            user: {
              profile: {
                preferences: {
                  theme: string;
                  notifications: boolean;
                }
              }
            }
          }>({
            user: {
              profile: {
                preferences: {
                  theme: 'light',
                  notifications: true
                }
              }
            }
          });

          updatePreferences() {
            this.#state.update(state => ({
              ...state,
              user: {
                ...state.user,
                profile: {
                  ...state.user.profile,
                  preferences: {
                    ...state.user.profile.preferences,
                    theme: 'dark'
                  }
                }
              }
            }));
          }
        }
      `,
    },
    // 複数のシグナルの相互作用
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #firstName = signal<string>('John');
          readonly #lastName = signal<string>('Doe');
          readonly #age = signal<number>(30);

          getFullName() {
            return \`\${this.#firstName()} \${this.#lastName()}\`;
          }

          updateProfile() {
            this.#firstName.update(name => name.toUpperCase());
            this.#lastName.update(name => name.toUpperCase());
            this.#age.update(age => age + 1);
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
              this.#id.update(value => ({ ...value, hoge: 1 }));
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
            this.#user.update(value => ({ ...value, name: 'Jane' }));
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
            this.#readonlyUser.update(value => ({ ...value, name: 'Jane' }));
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
            this.user.update(value => ({ ...value, name: 'Jane' }));
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
            this.user.update(value => ({ ...value, name: 'Jane' }));
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
            this.user.update(value => ({ ...value, name: 'Jane' }));
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
            this.user.update(value => ({ ...value, name: 'Jane' }));
          }
        }
      `,
    },
  ],
});
