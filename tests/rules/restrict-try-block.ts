import { RuleTester } from '@angular-eslint/test-utils';
import { Linter, Rule } from 'eslint';
import { resolve } from 'path';
import { parser } from 'typescript-eslint';
import rule from '../../src/rules/restrict-try-block';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ['file.ts'] },
      tsconfigRootDir: resolve(__dirname, '../..'),
    },
  },
});

const allowOnlySizeCheck = [{ allowPromise: true, allowRxjs: true, allowInSignal: true }] as const;
const allowOnlySignalCheck = [{ allowPromise: true, allowRxjs: true, maxLines: false }] as const;

ruleTester.run('restrict-try-block', rule, {
  valid: [
    `
      function parse(source: string) {
        try {
          return JSON.parse(source);
        } catch {
          return null;
        }
      }
    `,
    {
      code: `
        declare function consume(value: unknown): void;
        declare const anyValue: any;
        declare const unknownValue: unknown;
        try {
          consume(anyValue);
          consume(unknownValue);
        } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
    },
    {
      code: `
        try {
          const later = async () => Promise.resolve(1);
          class Later { async run() { return Promise.resolve(2); } }
        } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
    },
    {
      code: `
        function computed(callback: () => number): number { return callback(); }
        computed(() => {
          try { return 1; } catch { return 0; }
        });
      `,
      options: allowOnlySignalCheck,
    },
    {
      code: `
        class Observable<T> { subscribe(): T { throw new Error(); } }
        const source = new Observable<number>();
        try { source.subscribe(); } catch {}
      `,
      options: [{ allowPromise: true, allowInSignal: true, maxLines: false }],
    },
    {
      code: `
        import { computed } from '@angular/core';
        computed(() => {
          try { return JSON.parse('1'); } catch { return 0; }
        });
      `,
      options: [{ allowPromise: true, allowRxjs: true, allowInSignal: true, maxLines: false }],
    },
    {
      code: `
        async function run() {
          try { await Promise.resolve(1); } catch {}
        }
      `,
      options: [{ allowPromise: true, allowInSignal: true, maxLines: false }],
    },
    {
      code: `
        import { of } from 'rxjs';
        try { of(1).subscribe(); } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
    },
    {
      code: `
        import { effect } from '@angular/core';
        effect(() => {
          const later = () => {
            try { JSON.parse('bad'); } catch {}
          };
          later();
        });
      `,
      options: allowOnlySignalCheck,
    },
    {
      code: `
        try {
          run(); // inline comment

          // comment-only line
          finish();
        } catch {}
        declare function run(): void;
        declare function finish(): void;
      `,
      options: allowOnlySizeCheck,
    },
    {
      code: `
        async function run() {
          try { doWork(); } catch {
            await Promise.resolve();
          } finally {
            Promise.resolve();
          }
        }
        declare function doWork(): void;
      `,
    },
    {
      code: `
        try { first(); second(); third(); } catch {}
        declare function first(): void;
        declare function second(): void;
        declare function third(): void;
      `,
      options: [{ allowPromise: true, allowRxjs: true, allowInSignal: true, maxLines: 1 }],
    },
  ],
  invalid: [
    {
      code: `
        async function run() {
          try { await Promise.resolve(1); } catch {}
        }
      `,
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        type Work<T> = Promise<T>;
        declare const work: Work<number>;
        try { consume(work); } catch {}
        declare function consume(value: unknown): void;
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        async function load() {
          try { import('./feature'); } catch {}
        }
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        declare function load(strings: TemplateStringsArray): Promise<number>;
        try { load\`feature\`; } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        declare function consume(value: unknown): void;
        declare const thenable: PromiseLike<number>;
        try { consume(thenable); } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        try {
          Promise.resolve(1).catch(() => 0);
          Promise.resolve(2).then(() => 3);
        } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        try {
          try { Promise.resolve(1); } catch {}
        } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        declare function consume(value: unknown): void;
        declare const value: Promise<number> | undefined;
        try { consume(value); } catch {}
      `,
      options: [{ allowRxjs: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        import { of } from 'rxjs';
        try { of(1).pipe().subscribe(); } catch {}
      `,
      options: [{ allowPromise: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { BehaviorSubject } from 'rxjs';
        const state = new BehaviorSubject(0);
        try { state.next(1); } catch {}
      `,
      options: [{ allowPromise: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { Subject } from 'rxjs';
        class State<T> extends Subject<T> {}
        const state = new State<number>();
        try { state.next(1); } catch {}
      `,
      options: [{ allowPromise: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { Observable as Stream } from 'rxjs';
        type Source<T> = Stream<T>;
        declare const source: Source<number>;
        try { source.subscribe(); } catch {}
      `,
      options: [{ allowPromise: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { firstValueFrom, of } from 'rxjs';
        try { firstValueFrom(of(1)); } catch {}
      `,
      options: [{ allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }, { messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { lastValueFrom, of } from 'rxjs';
        try { lastValueFrom(of(1)); } catch {}
      `,
      options: [{ allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }, { messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { of } from 'rxjs';
        try {
          Promise.resolve(1);
          of(1);
        } catch {}
      `,
      options: [{ allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'promiseNotAllowed' }, { messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { of } from 'rxjs';
        try {
          of(1);
          Promise.resolve(1);
        } catch {}
      `,
      options: [{ allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'rxjsNotAllowed' }, { messageId: 'promiseNotAllowed' }],
    },
    {
      code: `
        import { of } from 'rxjs';
        try {
          Promise.resolve(1);
          of(1);
        } catch {}
      `,
      options: [{ allowPromise: true, allowInSignal: true, maxLines: false }],
      errors: [{ messageId: 'rxjsNotAllowed' }],
    },
    {
      code: `
        import { computed } from '@angular/core';
        const value = computed(() => {
          try { return JSON.parse('1'); } catch { return 0; }
        });
      `,
      options: allowOnlySignalCheck,
      errors: [{ messageId: 'signalContextNotAllowed' }],
    },
    {
      code: `
        import { effect as react } from '@angular/core';
        react(() => {
          try { JSON.parse('1'); } catch {}
        });
      `,
      options: allowOnlySignalCheck,
      errors: [{ messageId: 'signalContextNotAllowed' }],
    },
    {
      code: `
        import * as ng from '@angular/core';
        ng.effect(() => {
          try { JSON.parse('1'); } catch {}
        });
      `,
      options: allowOnlySignalCheck,
      errors: [{ messageId: 'signalContextNotAllowed' }],
    },
    {
      code: `
        try {
          first();
          second();
          third();
          fourth();
        } catch {}
        declare function first(): void;
        declare function second(): void;
        declare function third(): void;
        declare function fourth(): void;
      `,
      options: allowOnlySizeCheck,
      errors: [{ messageId: 'tooManyLines', data: { actual: 4, max: 3 } }],
    },
    {
      code: `
        try {
          if (ready) {
            work();
          }
        } catch {}
        declare const ready: boolean;
        declare function work(): void;
      `,
      options: [{ allowPromise: true, allowRxjs: true, allowInSignal: true, maxLines: 2 }],
      errors: [{ messageId: 'tooManyLines', data: { actual: 3, max: 2 } }],
    },
    {
      code: `
        try {
          const text = \`first

          third\`;
        } catch {}
      `,
      options: [{ allowPromise: true, allowRxjs: true, allowInSignal: true, maxLines: 2 }],
      errors: [{ messageId: 'tooManyLines', data: { actual: 3, max: 2 } }],
    },
  ],
});

describe('restrict-try-block configuration', () => {
  function verifyWithoutTypedLinting(code: string, options?: Record<string, unknown>) {
    const linter = new Linter({ configType: 'flat' });
    return linter.verify(
      code,
      [
        {
          files: ['**/*.ts'],
          languageOptions: { parser },
          plugins: { test: { rules: { 'restrict-try-block': rule as unknown as Rule.RuleModule } } },
          rules: {
            'test/restrict-try-block': options ? ['error', options] : 'error',
          },
        },
      ],
      { filename: 'file.ts' },
    );
  }

  it('skips type-dependent Promise and RxJS checks without typed linting', () => {
    expect(
      verifyWithoutTypedLinting(`
        import { of } from 'rxjs';
        try { Promise.resolve(of(1)); } catch {}
      `),
    ).toEqual([]);
  });

  it('skips dynamic import Promise detection without typed linting', () => {
    expect(verifyWithoutTypedLinting("try { import('./feature'); } catch {}")).toEqual([]);
  });

  it('keeps syntax-based await checks without typed linting', () => {
    expect(verifyWithoutTypedLinting('async function run() { try { await work(); } catch {} }')).toEqual([
      expect.objectContaining({ messageId: 'promiseNotAllowed' }),
    ]);
  });

  it('keeps Angular Signal context checks without typed linting', () => {
    expect(
      verifyWithoutTypedLinting(`
        import { computed } from '@angular/core';
        computed(() => { try { return JSON.parse('1'); } catch { return 0; } });
      `),
    ).toEqual([expect.objectContaining({ messageId: 'signalContextNotAllowed' })]);
  });

  it('keeps maxLines checks without typed linting', () => {
    expect(
      verifyWithoutTypedLinting(`
        try {
          first();
          second();
          third();
          fourth();
        } catch {}
      `),
    ).toEqual([expect.objectContaining({ messageId: 'tooManyLines' })]);
  });

  it('rejects an invalid maxLines option through the rule schema', () => {
    expect(() =>
      verifyWithoutTypedLinting('try { JSON.parse(source); } catch {}', {
        allowPromise: true,
        allowRxjs: true,
        allowInSignal: true,
        maxLines: 0,
      }),
    ).toThrow(/should be >= 1/u);
  });
});
