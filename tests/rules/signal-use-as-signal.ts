import { RuleTester } from '@angular-eslint/test-utils';
import rule from '../../src/rules/signal-use-as-signal';

new RuleTester().run('signal-use-as-signal', rule, {
  valid: [
    {
      code: `
        @Component()
        export class SigninPage {
          #user = 'John';
        
          getUpperUserName() {
            this.#user = 'Perry';
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          #user = signal<string>('John');
        
          getUpperUserName() {
            const user = this.#user().toUpperCase();
          }
        }
      `,
    },
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
    // toSignalのテスト
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #observable = new BehaviorSubject<number>(0);
          readonly #converted = toSignal(this.#observable);

          useConverted() {
            const value = this.#converted();
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: signal<{ name: string }>({ name: 'John' })
          };

          updateUser() {
            this.#user.first.update(value => ({ ...value, name: 'Jane' }));
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
    // 配列の直接操作
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #items = signal<string[]>(['a', 'b', 'c']);

          updateItems() {
            this.#items().splice(1, 1);
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #items = signal<string[]>(['a', 'b', 'c']);

          updateItems() {
            this.#items.update(value => { value.splice(1, 1); return value; });
          }
        }
      `,
    },
    // ネストされたオブジェクトの直接操作
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #config = signal<{ settings: { theme: string } }>({ settings: { theme: 'light' } });

          updateTheme() {
            this.#config().settings.theme = 'dark';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #config = signal<{ settings: { theme: string } }>({ settings: { theme: 'light' } });

          updateTheme() {
            this.#config.update(value => ({ ...value, settings: { ...value.settings, theme: 'dark' } }));
          }
        }
      `,
    },
    // シグナルの直接代入
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #value = signal<number>(0);

          updateValue() {
            this.#value() = 42;
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 7 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #value = signal<number>(0);

          updateValue() {
            this.#value.set(42);
          }
        }
      `,
    },
    // 複数のシグナルの不正な組み合わせ
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #count = signal<number>(0);
          readonly #multiplier = signal<number>(2);

          calculate() {
            this.#count() = this.#count() * this.#multiplier();
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 8 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #count = signal<number>(0);
          readonly #multiplier = signal<number>(2);

          calculate() {
            this.#count.set(this.#count() * this.#multiplier());
          }
        }
      `,
    },
    // 複数のシグナルの不正な相互作用
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #firstName = signal<string>('John');
          readonly #lastName = signal<string>('Doe');
          readonly #age = signal<number>(30);

          updateProfile() {
            this.#firstName() = this.#firstName().toUpperCase();
            this.#lastName() = this.#lastName().toUpperCase();
            this.#age() = this.#age() + 1;
          }
        }
      `,
      errors: [
        { messageId: 'signalUseAsSignal', line: 9 },
        { messageId: 'signalUseAsSignal', line: 10 },
        { messageId: 'signalUseAsSignal', line: 11 },
      ],
      output: `
        @Component()
        export class SigninPage {
          readonly #firstName = signal<string>('John');
          readonly #lastName = signal<string>('Doe');
          readonly #age = signal<number>(30);

          updateProfile() {
            this.#firstName.set(this.#firstName().toUpperCase());
            this.#lastName.set(this.#lastName().toUpperCase());
            this.#age.set(this.#age() + 1);
          }
        }
      `,
    },
    // 深くネストされたオブジェクトの不正な更新
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
            this.#state().user.profile.preferences.theme = 'dark';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 25 }],
      output: `
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
            this.#state.update(value => ({ ...value, user: { ...value.user, profile: { ...value.user.profile, preferences: { ...value.user.profile.preferences, theme: 'dark' } } } }));
          }
        }
      `,
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: signal<{ name: string }>({ name: 'John' })
          };

          updateUser() {
            this.#user.first.name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 9 }],
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: {
              second: signal<{ name: string }>({ name: 'John' })
            }
          };

          updateUser() {
            this.#user.first.second.name = 'Jane';
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 11 }],
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: {
              second: signal<{ name: string }>({ name: 'John' })
            }
          };

          updateUser() {
            if (this.#user.first.second) {
            }
          }
        }
      `,
      output: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: {
              second: signal<{ name: string }>({ name: 'John' })
            }
          };

          updateUser() {
            if (this.#user.first.second()) {
            }
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 11 }],
    },
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #user = {
            first: signal<{ name: string }>({ name: 'John' })
          };

          updateUser() {
            this.#user.first = { name: 'John' };
            this.#user.first.name = 'John';
          }
        }
      `,
      errors: [
        { messageId: 'signalUseAsSignal', line: 9 },
        { messageId: 'signalUseAsSignal', line: 10 },
      ],
    },
    // toSignalの不正な使い方
    {
      code: `
        @Component()
        export class SigninPage {
          readonly #observable = new BehaviorSubject<number>(0);
          readonly #converted = toSignal(this.#observable);

          updateConverted() {
            this.#converted() = 42;
          }
        }
      `,
      errors: [{ messageId: 'signalUseAsSignal', line: 8 }],
      output: `
        @Component()
        export class SigninPage {
          readonly #observable = new BehaviorSubject<number>(0);
          readonly #converted = toSignal(this.#observable);

          updateConverted() {
            this.#converted.set(42);
          }
        }
      `,
    },
  ],
});
