import rule from '../../src/rules/component-property-use-readonly';
import { RuleTester } from '@angular-eslint/test-utils';

new RuleTester().run('component-property-use-readonly', rule, {
  valid: [
    {
      code: `
      @Component({
        selector: 'app-example',
        template: '<div>example</div>'
      })
      export class ExampleComponent {
        readonly a = 1;
        public readonly b = 2;
        private readonly c = 3;
        protected readonly d = 4;
        readonly #e = 5;
        static readonly f = 6;
        // 初期化なし
        readonly g: number;
        // getter/setter
        get value() { return 1; }
        set value(v) {}
        // メソッド
        method() {}
        // computed property
        readonly ['h'] = 7;
        // デコレータ付き
        @Input() readonly i = 8;
        // 関数プロパティ
        trackByFn = (_: number, item: number) => item;
        handleClick = () => { /* ... */ };
      }
      `,
    },
    // ignorePrivateProperties: true の場合、privateプロパティは無視される
    {
      code: `
      @Component({
        selector: 'app-example',
        template: '<div>example</div>'
      })
      export class ExampleComponent {
        readonly publicProp = 1;
        private privateProp = 2;
        #secretProp = 3;
        public readonly publicReadonlyProp = 4;
        private privateReadonlyProp = 5;
        readonly #secretReadonlyProp = 6;
      }
      `,
      options: [{ ignorePrivateProperties: true }],
    },
    // 通常のクラスは対象外
    {
      code: `class B { x = 1; }`,
    },
    // 通常のクラスのメソッドは対象外
    {
      code: `class C { foo() {}; get bar() { return 1; } set bar(v) {} }`,
    },
    // 通常のクラスの初期化なしプロパティは対象外
    {
      code: `class D { y: number; }`,
    },
    // 通常のクラスのstaticプロパティは対象外
    {
      code: `class E { static z = 10; }`,
    },
  ],
  invalid: [
    // Componentクラスのプロパティ
    {
      code: `
      @Component({
        selector: 'app-example',
        template: '<div>example</div>'
      })
      export class ExampleComponent {
        x = 1;
        public y = 2;
        private z = 3;
        protected w = 4;
        #secret = 42;
        static a = 1;
        ['foo'] = 1;
        @Input() i = 8;
        h: number;
        // 関数プロパティはreadonlyを要求しない
        trackByFn = (_: number, item: number) => item;
        handleClick = () => { /* ... */ };
      }
      `,
      output: `
      @Component({
        selector: 'app-example',
        template: '<div>example</div>'
      })
      export class ExampleComponent {
        readonly x = 1;
        public readonly y = 2;
        private readonly z = 3;
        protected readonly w = 4;
        readonly #secret = 42;
        static readonly a = 1;
        readonly ['foo'] = 1;
        @Input() readonly i = 8;
        readonly h: number;
        // 関数プロパティはreadonlyを要求しない
        trackByFn = (_: number, item: number) => item;
        handleClick = () => { /* ... */ };
      }
      `,
      errors: [
        { messageId: 'componentPropertyUseReadonly', line: 7 },
        { messageId: 'componentPropertyUseReadonly', line: 8 },
        { messageId: 'componentPropertyUseReadonly', line: 9 },
        { messageId: 'componentPropertyUseReadonly', line: 10 },
        { messageId: 'componentPropertyUseReadonly', line: 11 },
        { messageId: 'componentPropertyUseReadonly', line: 12 },
        { messageId: 'componentPropertyUseReadonly', line: 13 },
        { messageId: 'componentPropertyUseReadonly', line: 14 },
        { messageId: 'componentPropertyUseReadonly', line: 15 },
      ],
    },
    // ignorePrivateProperties: true の場合、public/protectedプロパティのみエラーになる
    {
      code: `
      @Component({
        selector: 'app-example',
        template: '<div>example</div>'
      })
      export class ExampleComponent {
        publicProp = 1;
        protected protectedProp = 2;
        private privateProp = 3;
        #secretProp = 4;
        static staticProp = 5;
      }
      `,
      output: `
      @Component({
        selector: 'app-example',
        template: '<div>example</div>'
      })
      export class ExampleComponent {
        readonly publicProp = 1;
        protected readonly protectedProp = 2;
        private privateProp = 3;
        #secretProp = 4;
        static readonly staticProp = 5;
      }
      `,
      options: [{ ignorePrivateProperties: true }],
      errors: [
        { messageId: 'componentPropertyUseReadonly', line: 7 },
        { messageId: 'componentPropertyUseReadonly', line: 8 },
        { messageId: 'componentPropertyUseReadonly', line: 11 },
      ],
    },
  ],
});
